import Vue, { VNode } from 'vue';
import intersection from 'lodash/intersection';
import { prefix } from '../config';
import Checkbox from './checkbox';
import checkboxGroupProps from './checkbox-group-props';
import { CheckboxOptionObj, TdCheckboxProps, CheckboxGroupValue } from './type';

const name = `${prefix}-checkbox-group`;

export default Vue.extend({
  name: 'TCheckboxGroup',
  components: {
    Checkbox,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: { ...checkboxGroupProps },

  data() {
    return {
      checkedMap: {},
    };
  },

  provide(): { checkboxGroup: any } {
    return {
      checkboxGroup: this,
    };
  },

  watch: {
    values: {
      immediate: true,
      handler() {
        if (this.value instanceof Array) {
          const map = {};
          this.value.forEach((item: string | number) => {
            map[item] = true;
          });
          this.checkedMap = map;
        }
      },
    },
  },

  computed: {
    optionList(): Array<CheckboxOptionObj> {
      if (!this.options) return [];
      return this.options.map((item) => {
        let r: CheckboxOptionObj = {};
        if (typeof item !== 'object') {
          r = { label: String(item), value: item };
        } else {
          r = { ...item };
          r.disabled = r.disabled === undefined ? this.disabled : r.disabled;
        }
        return r;
      });
    },
    values(): string {
      if (this.value instanceof Array) {
        return this.value.join();
      }
      return '';
    },
    intersectionLen(): number {
      const values = this.optionList.map((item) => item.value);
      if (this.value instanceof Array) {
        const n = intersection(this.value, values);
        return n.length;
      }
      return 0;
    },
    isCheckAll(): boolean {
      if (this.value instanceof Array && this.value.length !== this.optionList.length - 1) {
        return false;
      }
      return this.intersectionLen === this.optionList.length - 1;
    },
    indeterminate(): boolean {
      return !this.isCheckAll && this.intersectionLen < this.optionList.length && this.intersectionLen !== 0;
    },
    maxExceeded(): boolean {
      return this.max !== undefined && Object.keys(this.checkedMap).length === this.max;
    },
  },

  render(): VNode {
    return (
      <div class={name}>
        {!!this.optionList.length && this.optionList.map((option, index) => {
          if (option.checkAll) return this.renderCheckAll(option);
          return (
            <Checkbox
              key={index}
              props={{ ...option }}
              checked={this.checkedMap[option.value]}
            >
              {this.renderLabel(option)}
            </Checkbox>
          );
        })}
        {this.$scopedSlots.default && this.$scopedSlots.default(null)}
      </div>
    );
  },

  methods: {
    renderCheckAll(option: CheckboxOptionObj) {
      return (
        <Checkbox
          checked={this.isCheckAll}
          indeterminate={this.indeterminate}
          onChange={this.onCheckAllChange}
          data-name='TDESIGN_CHECK_ALL'
          props={{ ...option }}
        >{this.renderLabel(option)}</Checkbox>
      );
    },
    renderLabel(option: CheckboxOptionObj) {
      if (typeof option.label === 'function') {
        return option.label(this.$createElement);
      }
      return option.label;
    },
    emitChange(val: CheckboxGroupValue, e?: Event) {
      this.$emit('change', val, { e });
      typeof this.onChange === 'function' && this.onChange(val, { e });
    },
    handleCheckboxChange(data: { checked: boolean; e: Event; option: TdCheckboxProps }) {
      const oValue = data.option.value;
      if (this.value instanceof Array) {
        const val = [...this.value];
        if (data.checked) {
          val.push(oValue);
        } else {
          const i = val.indexOf(oValue);
          val.splice(i, 1);
        }
        this.emitChange(val, data.e);
        this.setCheckedMap(data.option.value, data.checked);
      }
    },
    setCheckedMap(value: string | number, checked: boolean) {
      this.checkedMap[value] = checked;
    },
    onCheckAllChange(checked: boolean, context: { e: Event }) {
      if (checked) {
        const val = [];
        for (let i = 0, len = this.optionList.length; i < len; i++) {
          const item = this.optionList[i];
          if (item.checkAll) continue;
          val.push(item.value);
          this.checkedMap = {
            ...this.checkedMap,
            [item.value]: true,
          };
          if (this.maxExceeded) break;
        }
        this.emitChange(val, context.e);
      } else {
        this.emitChange([], context.e);
        this.checkedMap = {};
      }
    },
  },
});
