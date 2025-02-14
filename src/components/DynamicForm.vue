<script setup>
import { reactive, watch } from 'vue'
import { useGlobalStore } from '@/store'
import { renderMarkdown } from '@/utils'
const emit = defineEmits(['update:modelValue', 'submit'])
const store = useGlobalStore()
const props = defineProps({
  structure: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const fieldsById = {}
props.structure.forEach((e) => {
  if (e.isInput) {
    fieldsById[e.id] = e
  }
})
const localData = reactive({ ...props.modelValue })
function handleUpdate(field, value) {
  if (field.injectInto) {
    // we implement extremely basic templating here
    // so we can inject values from other fields
    // in the value before injection in another field
    let injectData = {...localData}
    injectData.sexe = injectData.genre === 'masculin' ? 'homme' : 'femme'
    value = value.replace('{{ sexe }}', injectData.sexe)
    props.structure.forEach((f) => {
      if (f.isInput) {
        const search = `{{ ${f.id} }}`
        value = value.replace(search, injectData[f.id])
      }
    })
    localData[field.injectInto] = value.trim()
  } else {
    localData[field.id] = value
  }
  emit('update:modelValue', localData)
}
</script>

<template>
  <form @submit.prevent="$emit('submit')">
    <div class="document-form">
      <template v-for="element in props.structure" :key="JSON.stringify(element)">
        <template v-if="element.showCondition(localData)">
          <h2 v-if="element.isCategory" class="category">{{ element.name }}</h2>
          <div v-if="element.isInput" :class="['field', `field--${element.type}`]">
            <label v-if="element.type != 'checkbox'" :for="`field-${element.id}`">{{
              element.name
            }}</label>
            <textarea
              v-if="element.type === 'textarea'"
              :value="localData[element.id]"
              :id="`field-${element.id}`"
              v-bind="element.attributes || {rows: 3}"
              @input="handleUpdate(element, $event.target.value)"
              :disabled="disabled"
              :placeholder="element.placeholder"
            >
            </textarea>
          <select
            v-else-if="element.type === 'select'"
            :value="localData[element.id]"
            :id="`field-${element.id}`"
            @input="handleUpdate(element, $event.target.value)"
            :disabled="disabled"
          >
            <option v-for="(v, i) in element.choices" :key="i" :value="v.value">
              {{ v.label }}
            </option>
          </select>
          <div v-else-if="element.type === 'checkbox'" class="checkbox">
            <input
              type="checkbox"
              :checked="localData[element.id]"
              :id="`field-${element.id}`"
              @change="handleUpdate(element, $event.target.checked)"
              :disabled="disabled"
            />
              <label :for="`field-${element.id}`">{{ element.name }}</label>
            </div>
            <input
              v-else
              :type="element.type || 'text'"
              :value="localData[element.id]"
              :id="`field-${element.id}`"
              @input="handleUpdate(element, $event.target.value)"
              :disabled="disabled"
              :placeholder="element.placeholder"
              />
            <div v-if="element.help" class="text--small text--italic" v-html="renderMarkdown(element.help)"></div>
          </div>
        </template>
      </template>
    </div>
    <slot></slot>
  </form>
</template>
