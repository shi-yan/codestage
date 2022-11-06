<template>
  <li class="menu-item clickable-item">
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

.clickable-item {
  padding: 2px;
}

.clickable {
  cursor: pointer;
  margin-block-start: 4px;
  margin-block-end: 4px;
}

.clickable:hover {
  background-color: #222045;
  color: #ffffff;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #222045;
}
</style>
  