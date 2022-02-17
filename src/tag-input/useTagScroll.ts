/**
 * 当标签数量过多时，输入框显示不下，则需要滚动查看，以下为滚动逻辑
 * 如果标签过多时的处理方式，是标签省略，则不需要此功能
 */

import {
  onMounted, onUnmounted, ref, toRefs, getCurrentInstance,
} from '@vue/composition-api';
import { TdTagInputProps } from './type';

export default function useTagScroll() {
  const props = getCurrentInstance().props as TdTagInputProps;
  const tagInputRef = ref();
  const { excessTagsDisplayType, readonly, disabled } = toRefs(props);
  // 允许向右滚动的最大距离
  const scrollDistance = ref(0);
  const scrollElement = ref<HTMLElement>();
  const mouseEnterTimer = ref();

  const updateScrollElement = (element: HTMLElement) => {
    scrollElement.value = element;
  };

  const updateScrollDistance = () => {
    scrollDistance.value = scrollElement.value.scrollWidth - scrollElement.value.clientWidth;
  };

  const scrollTo = (distance: number) => {
    scrollElement.value?.scroll({ left: distance, behavior: 'smooth' });
  };

  const scrollToRight = () => {
    updateScrollDistance();
    scrollTo(scrollDistance.value);
  };

  const scrollToLeft = () => {
    scrollTo(0);
  };

  // TODO：MAC 电脑横向滚动，Windows 纵向滚动。当前只处理了横向滚动
  const onWheel = ({ e }: { e: WheelEvent }) => {
    if (readonly.value || disabled.value) return;
    if (!scrollElement.value) return;
    if (e.deltaX > 0) {
      const distance = Math.min(scrollElement.value.scrollLeft + 120, scrollDistance.value);
      scrollTo(distance);
    } else {
      const distance = Math.max(scrollElement.value.scrollLeft - 120, 0);
      scrollTo(distance);
    }
  };

  // 鼠标 hover，自动滑动到最右侧，以便输入新标签
  const scrollToRightOnEnter = () => {
    if (excessTagsDisplayType.value !== 'scroll') return;
    // 一闪而过的 mousenter 不需要执行
    mouseEnterTimer.value = setTimeout(() => {
      scrollToRight();
      clearTimeout(mouseEnterTimer.value);
    }, 100);
  };

  const scrollToLeftOnLeave = () => {
    if (excessTagsDisplayType.value !== 'scroll') return;
    scrollTo(0);
    clearTimeout(mouseEnterTimer.value);
  };

  const init = () => {
    const element = tagInputRef.value?.$el;
    if (!element) return;
    updateScrollElement(element);
  };

  const clear = () => {
    clearTimeout(mouseEnterTimer.value);
  };

  onMounted(init);

  onUnmounted(clear);

  return {
    tagInputRef,
    scrollElement,
    scrollDistance,
    scrollTo,
    scrollToRight,
    scrollToLeft,
    updateScrollElement,
    updateScrollDistance,
    onWheel,
    scrollToRightOnEnter,
    scrollToLeftOnLeave,
  };
}
