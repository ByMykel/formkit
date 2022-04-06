import { getNode, reset } from '@formkit/core'
import { token } from '@formkit/utils'
import defaultConfig from '../src/defaultConfig'
import { plugin } from '../src/plugin'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

describe('numeric lists', () => {
  it('uses list index as key', () => {
    mount(
      {
        template: `
        <FormKit
          type="list"
          id="listA"
        >
          <FormKit value="foo" name="first" />
          <FormKit value="bar" name="second" />
          <FormKit value="baz" name="third" />
        </FormKit>
      `,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    expect(getNode('listA')!.value).toStrictEqual(['foo', 'bar', 'baz'])
  })

  it('can show a validation error without validation-label', () => {
    const wrapper = mount(
      {
        template: `
        <FormKit
          type="list"
          id="listA"
        >
          <FormKit name="first" />
          <FormKit name="second" validation="required" validation-visibility="live" />
          <FormKit name="third" />
        </FormKit>
      `,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    expect(wrapper.html()).toContain('>1 is required')
  })

  it('can reset a list of objects to their original state', async () => {
    const wrapper = mount(
      {
        data() {
          return {
            books: [
              {},
              { title: 'To Kill A Mockingbird', author: 'Harper Lee' },
            ],
          }
        },
        template: `
        <div>
          <FormKit type="list" v-model="books" id="books">
            <FormKit type="group">
              <FormKit name="title" value="A Farewell to Arms" />
              <FormKit name="author" />
            </FormKit>
            <FormKit type="group">
              <FormKit name="title" />
              <FormKit name="author" />
            </FormKit>
            <FormKit type="group">
              <FormKit name="title" />
              <FormKit name="author" />
            </FormKit>
          </FormKit>
        </div>
      `,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    const [titleA, authorA, titleB, authorB, titleC, authorC] = wrapper
      .get('div')
      .findAll('input')
    expect(titleA.element.value).toBe('A Farewell to Arms')
    expect(authorA.element.value).toBe('')
    expect(titleB.element.value).toBe('To Kill A Mockingbird')
    expect(authorB.element.value).toBe('Harper Lee')
    expect(titleC.element.value).toBe('')
    expect(authorC.element.value).toBe('')
    titleC.setValue('The Great Gatsby')
    authorC.setValue('F. Scott Fitzgerald')
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.vm.books).toStrictEqual([
      { title: 'A Farewell to Arms', author: undefined },
      { title: 'To Kill A Mockingbird', author: 'Harper Lee' },
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    ])
    reset('books')
    await nextTick()
    expect(titleA.element.value).toBe('A Farewell to Arms')
    expect(authorA.element.value).toBe('')
    expect(titleB.element.value).toBe('To Kill A Mockingbird')
    expect(authorB.element.value).toBe('Harper Lee')
    expect(titleC.element.value).toBe('')
    expect(authorC.element.value).toBe('')
    expect(getNode('books')!.value).toStrictEqual([
      { title: 'A Farewell to Arms', author: undefined },
      { title: 'To Kill A Mockingbird', author: 'Harper Lee' },
      { title: undefined, author: undefined },
    ])
  })

  it('can insert an input between other inputs', async () => {
    const wrapper = mount(
      {
        data() {
          return {
            showB: false,
            values: [],
          }
        },
        template: `<FormKit type="list" v-model="values">
        <FormKit value="A" />
        <FormKit value="B" v-if="showB" :index="1" />
        <FormKit value="C" />
      </FormKit>
      `,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )

    expect(wrapper.vm.values).toStrictEqual(['A', 'C'])
    wrapper.vm.showB = true
    await new Promise((r) => setTimeout(r, 25))
    expect(wrapper.vm.values).toStrictEqual(['A', 'B', 'C'])
  })

  it('can spawn a node that absorbs the value at a given index', async () => {
    const id = token()
    const hij = token()
    const wrapper = mount(
      {
        data() {
          return {
            def: false,
            values: [] as string[],
          }
        },
        template: `<FormKit type="list" v-model="values" id="${id}">
        <FormKit value="ABC" />
        <FormKit value="HIJ" id="${hij}" />
      </FormKit>`,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    expect(wrapper.vm.values).toStrictEqual(['ABC', 'HIJ'])
    wrapper.vm.values.splice(1, 0, 'DEF')
    await nextTick()
    expect(wrapper.vm.values).toStrictEqual(['ABC', 'DEF', 'HIJ'])
    const node = getNode(hij)!
    expect(node.value).toBe('HIJ')
    node.input('XYZ', false)
    expect(wrapper.vm.values).toStrictEqual(['ABC', 'XYZ', 'HIJ'])
  })

  // it.only('can render a list of inputs each with an index number', async () => {
  //   const wrapper = mount(
  //     {
  //       data() {
  //         return {
  //           showB: false,
  //           values: ['A', 'B', 'C'],
  //         }
  //       },
  //       template: `<FormKit type="list" v-model="values">
  //       <FormKit
  //         v-for="(value, index) in values"
  //         v-if="values.length < 10"
  //         :key="value"
  //         :value="value"
  //         :index="1 * index"
  //       />
  //     </FormKit>
  //     `,
  //     },
  //     {
  //       global: {
  //         plugins: [[plugin, defaultConfig]],
  //       },
  //     }
  //   )
  //   console.log(wrapper.vm.values)
  //   expect(wrapper.vm.values).toStrictEqual(['A', 'B', 'C'])
  // })

  // it.only('can remove an item by inputting a smaller array', async () => {
  //   const wrapper = mount(
  //     {
  //       data() {
  //         return {
  //           values: [{}, {}, {}],
  //         }
  //       },
  //       template: `
  //       <div>
  //         <FormKit type="list" :delay="0" v-model="values" #default="{ value }">
  //           <template v-for="item in value">
  //             <FormKit
  //               v-if="item !== undefined"
  //               type="group"
  //             >
  //               <FormKit name="biz" />
  //             </FormKit>
  //           </template>
  //         </FormKit>
  //       </div>
  //     `,
  //     },
  //     {
  //       global: {
  //         plugins: [[plugin, defaultConfig]],
  //       },
  //     }
  //   )
  //   expect(wrapper.get('div').findAll('input').length).toBe(3)
  //   wrapper.vm.values = [{}, {}]
  //   await new Promise((r) => setTimeout(r, 30))
  //   console.log('values: ', wrapper.vm.values)
  //   expect(wrapper.get('div').findAll('input').length).toBe(2)
  // })
})
