import Vue, { VNode, PropType } from 'vue';
import { prefix } from '../../config';
import {
  TransferItemOption,
  TransferListType,
  TransferValue,
  TdTransferProps,
  EmptyType,
  SearchEvent,
  SearchOption,
  PageInfo,
  TdPaginationProps,
  CheckboxProps,
} from '../type/transfer';
import Checkbox from '../../checkbox';
import { renderTNodeJSXDefault } from '../../utils/render-tnode';
import TransferListContent from './transfer-list-content';
import Search from './transfer-search';


const name = `${prefix}-transfer-list`;

export default Vue.extend({
  name,
  components: {
    TransferListContent,
    Search,
    Checkbox,
  },
  props: {
    checkboxProps: {
      type: Object as PropType<CheckboxProps>,
      default: () => ({}),
    },
    dataSource: {
      type: Array as PropType<Array<TransferItemOption>>,
      default(): Array<TransferItemOption> {
        return [];
      },
    },
    listType: {
      type: String as PropType<TransferListType>,
      default: 'target',
    },
    title: {
      type: [String, Function],
    },
    checkedValue: {
      type: Array as PropType<Array<TransferValue>>,
      default(): Array<TransferValue> {
        return [];
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    search: {
      type: [Boolean, Object] as PropType<SearchOption>,
      default: false,
    },
    transferItem: Function as PropType<TdTransferProps['transferItem']>,
    empty: {
      type: [Function, String] as PropType<EmptyType>,
    },
    pagination: [Boolean, Object],
    footer: [Function, String],
    checkAll: Boolean,
  },
  data() {
    return {
      name,
      filterValue: '', // 搜索框输入内容,
      // 用于兼容处理 Pagination 的非受控属性（非受控属性仅有 change 事件变化，无 props 变化，因此只需监听事件）
      defaultCurrent: 1,
      // 用于兼容处理 Pagination 的非受控属性
      defaultPageSize: 0,
    };
  },
  computed: {
    // this.defaultCurrent 属于分页组件抛出的事件参数，非受控的情况也会有该事件触发
    // this.pagination.defaultCurrent 为表格组件传入的非受控属性
    currentPage(): number {
      return this.pagination.current || this.defaultCurrent || this.pagination.defaultCurrent;
    },
    pageSize(): number {
      return this.pagination.pageSize || this.defaultPageSize || this.pagination.defaultPageSize;
    },
    pageTotal(): number {
      return (this.filteredData && this.filteredData.length) || 0;
    },
    filteredData(): Array<TransferItemOption> {
      return this.dataSource.filter((item: TransferItemOption) => {
        const label = item && item.label.toString();
        return label.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1;
      });
    },
    curPageData(): Array<TransferItemOption> {
      let pageData = this.filteredData;
      if (!this.pagination) return pageData;
      if (this.pageSize === 0) return pageData;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = this.currentPage * this.pageSize;
      pageData = pageData.slice(startIndex, endIndex);
      return pageData;
    },
    paginationProps(): TdPaginationProps {
      const defaultPaginationProps: TdPaginationProps = {
        size: 'small',
        theme: 'simple',
        totalContent: false,
        pageSizeOptions: [],
      };
      return typeof this.pagination === 'object' ? {
        ...defaultPaginationProps, ...this.pagination,
        current: this.currentPage,
        total: this.pageTotal,
        pageSize: this.pageSize,
      } : {};
    },
    hasFooter(): boolean {
      return !!this.$slots.default;
    },
    indeterminate(): boolean {
      return !this.isAllChecked && this.checkedValue.length > 0;
    },
    isAllChecked(): boolean {
      return this.checkedValue.length > 0 && this.dataSource.every(item => this.checkedValue.includes(item.value));
    },
  },
  methods: {
    handlePaginationChange(pageInfo: PageInfo): void {
      this.$emit('pageChange', pageInfo);
      this.defaultCurrent = pageInfo.current;
      this.defaultPageSize = pageInfo.pageSize;
    },
    handleCheckedChange(val: Array<TransferValue>): void {
      this.$emit('checkedChange', val);
    },
    handleCheckedAllChange(checked: boolean): void {
      if (checked) {
        const allValue = this.dataSource.map(item => item.value);
        this.handleCheckedChange(allValue);
      } else {
        this.handleCheckedChange([]);
      }
    },
    scroll(e: Event): void {
      this.$emit('scroll', e);
    },
    handleSearch(e: any): void {
      const event: SearchEvent = {
        query: e.value,
        type: this.listType as TransferListType,
        e: e.e,
        trigger: e.trigger,
      };
      this.$emit('search', event);
    },
    renderTitle() {
      const defaultNode = this.title && typeof this.title === 'string' ? (<template>{this.title}</template>) : null;
      const titleNode = renderTNodeJSXDefault(this, 'title', {
        defaultNode,
        params: {
          type: this.listType,
        },
      });
      return (<span>{titleNode}</span>);
    },
    renderContent() {
      return (
        <transfer-list-content
          checkboxProps={this.checkboxProps}
          checked={this.checkedValue}
          disabled={this.disabled}
          class={`${this.name}__content`}
          filteredData={this.curPageData}
          transfer-item={this.transferItem}
          list-type={this.listType}
          onCheckedChange={this.handleCheckedChange}
          onScroll={this.scroll}
        />
      );
    },
    renderEmpty() {
      const defaultNode: VNode = typeof this.empty === 'string' ? (<template>{this.empty}</template>) : null;
      return (
        <div class="t-transfer-empty">
          {renderTNodeJSXDefault(this, 'empty', {
            defaultNode,
            params: {
              type: this.listType,
            },
          })}
        </div>
      );
    },
    renderFooter() {
      const defaultNode = typeof this.footer === 'string' ? (<div class={`${prefix}-transfer-footer`}>{this.footer}</div>) : null;
      return renderTNodeJSXDefault(this, 'footer', {
        defaultNode,
        params: {
          type: this.listType,
        },
      });
    },
  },
  render() {
    return (
      <div class={`${this.name} ${this.name}-${this.listType}`}>
        <div class={`${this.name}__header`}>
          <div>
            {
              this.checkAll
              && <checkbox
                disabled={this.disabled}
                checked={this.isAllChecked}
                indeterminate={this.indeterminate}
                onChange={this.handleCheckedAllChange}
              />
            }
            <span>{this.checkedValue.length} / {this.dataSource.length}项</span>
          </div>
          {this.renderTitle()}
        </div>
        <div class={[`${this.name}__body`, this.search ? `${this.name}-with-search` : '']}>
          {this.search && <search searchValue={this.filterValue} onChange={(e: string) => this.filterValue = e} disabled={this.disabled} search={this.search} onSearch={this.handleSearch} />}
          {this.curPageData.length > 0 ? this.renderContent() : this.renderEmpty()}
        </div>
        {
          (this.pagination && this.pageSize > 0)
          && <div class={`${this.name}__pagination`}>
            <t-pagination
              props={this.paginationProps}
              onChange={this.handlePaginationChange}
            />
          </div>
        }
        {this.renderFooter()}
      </div>
    );
  },
});