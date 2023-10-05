export default defineEventHandler(async event => {
  const { foo } = await $fetch('/foo', { method: 'post' })
  return { foo, bar: 'bar' }
})
