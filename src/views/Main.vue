<template>
	<div>
		<v-navigation-drawer app>
			<my-menu class="menu"></my-menu>
		</v-navigation-drawer>
		<v-main class="white">
			<router-view />
		</v-main>
		<v-footer app> </v-footer>
	</div>
</template>
<script>
export default {
	components: {
		'my-menu': () => import('@/components/Menu.vue'),
	},
}
</script>
<style lang="scss" scoped>
.menu {
	height: 100%;
}
</style>
