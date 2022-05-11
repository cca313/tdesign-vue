import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Tree from '@/src/tree/index.ts';

describe('Tree:props:events', () => {
  jest.useRealTimers();
  describe('event:active', () => {
    it('onActive 回调可触发', (done) => {
      const data = [{ value: 't1' }, { value: 't2' }];
      mount(
        Vue.component('test', {
          components: {
            Tree,
          },
          template: ['<Tree', 'ref="tree"', ':data="items"', 'activable', ':onActive="onActive"', '></Tree>'].join(' '),
          data() {
            return {
              items: data,
            };
          },
          methods: {
            onActive(activated, context) {
              expect(activated.length).toBe(1);
              expect(activated[0]).toBe('t2');
              expect(context.node.value).toBe('t2');
              done();
            },
          },
          mounted() {
            this.$refs.tree.setItem('t2', {
              activated: true,
            });
          },
        }),
      );
    }, 10);

    it('active 事件可触发', (done) => {
      const data = [{ value: 't1' }, { value: 't2' }];
      mount(
        Vue.component('test', {
          components: {
            Tree,
          },
          template: ['<Tree', 'ref="tree"', ':data="items"', 'activable', '@active="onActive"', '></Tree>'].join(' '),
          data() {
            return {
              items: data,
            };
          },
          methods: {
            onActive(activated, context) {
              expect(activated.length).toBe(1);
              expect(activated[0]).toBe('t2');
              expect(context.node.value).toBe('t2');
              done();
            },
          },
          mounted() {
            this.$refs.tree.setItem('t2', {
              activated: true,
            });
          },
        }),
      );
    }, 10);
  });

  describe('event:expand', () => {
    it('onExpand 回调可触发', (done) => {
      const data = [
        {
          value: 't1',
          children: [
            {
              value: 't1.1',
            },
          ],
        },
        {
          value: 't2',
          children: [
            {
              value: 't2.1',
            },
          ],
        },
      ];

      mount(
        Vue.component('test', {
          components: {
            Tree,
          },
          template: ['<Tree', 'ref="tree"', ':data="items"', ':onExpand="onExpand"', '></Tree>'].join(' '),
          data() {
            return {
              items: data,
            };
          },
          methods: {
            onExpand(expanded, context) {
              expect(expanded.length).toBe(1);
              expect(expanded[0]).toBe('t2');
              expect(context.node.value).toBe('t2');
              done();
            },
          },
          mounted() {
            this.$refs.tree.setItem('t2', {
              expanded: true,
            });
          },
        }),
      );
    }, 10);

    it('expand 事件可触发', (done) => {
      const data = [
        {
          value: 't1',
          children: [
            {
              value: 't1.1',
            },
          ],
        },
        {
          value: 't2',
          children: [
            {
              value: 't2.1',
            },
          ],
        },
      ];

      mount(
        Vue.component('test', {
          components: {
            Tree,
          },
          template: ['<Tree', 'ref="tree"', ':data="items"', '@expand="onExpand"', '></Tree>'].join(' '),
          data() {
            return {
              items: data,
            };
          },
          methods: {
            onExpand(expanded, context) {
              expect(expanded.length).toBe(1);
              expect(expanded[0]).toBe('t2');
              expect(context.node.value).toBe('t2');
              done();
            },
          },
          mounted() {
            this.$refs.tree.setItem('t2', {
              expanded: true,
            });
          },
        }),
      );
    }, 10);
  });

  describe('event:change', () => {
    it('onChange 回调可触发', (done) => {
      const data = [
        {
          value: 't1',
          children: [
            {
              value: 't1.1',
            },
          ],
        },
        {
          value: 't2',
          children: [
            {
              value: 't2.1',
            },
          ],
        },
      ];
      const onChange = (checked, context) => {
        expect(checked.length).toBe(1);
        expect(checked[0]).toBe('t2.1');
        expect(context.node.value).toBe('t2');
        done();
      };
      mount({
        mounted() {
          this.$refs.tree.setItem('t2', {
            checked: true,
          });
        },
        render() {
          return <Tree ref="tree" data={data} checkable onChange={onChange}></Tree>;
        },
      });
    }, 10);
  });

  describe('event:load', () => {
    it('onLoad 回调可触发', (done) => {
      const data = [
        {
          label: '1',
          value: 't1',
          children: true,
        },
      ];

      const onLoad = (context) => {
        expect(context.node.value).toBe('t1');
        done();
      };

      const loadData = (node) => new Promise((resolve) => {
        setTimeout(() => {
          let nodes = [];
          if (node.level < 1) {
            nodes = [
              {
                value: `${node.value}.1`,
                label: `${node.label}.1`,
                children: true,
              },
            ];
          }
          resolve(nodes);
        }, 1);
      });

      mount({
        render() {
          return <Tree ref="tree" data={data} expand-all lazy={false} load={loadData} onLoad={onLoad}></Tree>;
        },
      });
    }, 10);
  });
});
