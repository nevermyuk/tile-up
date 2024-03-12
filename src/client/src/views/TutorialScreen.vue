<template>
  <div>
    <b-modal ref="tutorial-modal" hide-footer :hide-header-close="true">
      <div class="d-block text-center">
        <h3>Tutorial Screen</h3>
        <div>
          <iframe
            width="400"
            height="315"
            src="https://www.youtube.com/embed/dcnkhl1cSEc"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <b-button
        class="mt-3"
        variant="outline-secondary"
        block
        @click="hideModal"
        >Close Me</b-button
      >
    </b-modal>
  </div>
</template>

<script>
export default {
  methods: {
    showModal() {
      this.$refs["tutorial-modal"].show();
    },
    hideModal() {
      this.$refs["tutorial-modal"].hide();
    },
  },
};
</script>
