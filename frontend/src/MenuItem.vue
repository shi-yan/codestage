<template>
  <li>
    <h3 :class="{ clickable: item.folder }" @click="onSelect">
      {{ item.title }}
    </h3>
    <ul v-if="item.sub_chapters && item.sub_chapters.length > 0">
      <menu-item
        v-for="item in item.sub_chapters"
        :key="item.title"
        :item="item"
      >
      </menu-item>
    </ul>
  </li>
</template>
  
<script>
export default {
  name: "MenuItem",
  components: {},
  props: {
    item: Object,
  },
  data: function () {
    return {};
  },
  mounted: async function () {},
  methods: {
    onSelect: function () {
        console.log("clicked ==")
        this.eventBus.emit("load", this.item);
      
    },
  },
};
</script>
  
<style>
.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: red;
}
</style>
  