<template>
	<v-card class="mx-auto" width="256" tile>
		<v-navigation-drawer permanent>
			<v-list>
				<v-list-item>
					<v-list-item-avatar>
						<v-img
							src="https://github.githubassets.com/pinned-octocat.svg"
						></v-img>
					</v-list-item-avatar>
				</v-list-item>

				<v-list-item link>
					<v-list-item-content>
						<v-list-item-title class="title">
							Ran Feng
						</v-list-item-title>
						<v-list-item-subtitle>2862284818@qq.com</v-list-item-subtitle>
					</v-list-item-content>

					<v-list-item-action>
						<v-icon>mdi-menu-down</v-icon>
					</v-list-item-action>
				</v-list-item>
			</v-list>
			<v-divider></v-divider>
			<v-list nav dense>
				<v-list-item-group v-model="selectedItem" color="primary">
					<v-list-item v-for="(item, i) in items" :key="i" :to="item.url">
						<v-list-item-content>
							<v-list-item-title v-text="item.text"></v-list-item-title>
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
		<v-snackbar v-model="snackbar">
			{{ toastText }}
		</v-snackbar>
	</v-card>
</template>
<script>
export default {
	data: () => ({
		snackbar: false,
		toastText: '获取博客分类失败',
		selectedItem: 0,
		items: [
			{ text: '最新文章', url: '/view/new' },
			{ text: 'HTML/CSS', url: '/view/html' },
			{ text: 'JavaScript', url: '/view/javascript' },
			{ text: '前端框架', url: '/view/frame' },
			{ text: '工具', url: '/view/tool' },
			{ text: 'markdown编辑器', url: '/add' },
		],
	}),
	created() {
		const array = ['new', 'html', 'javascript', 'frame', 'tool']
		const tag = this.$route.path.split('/').pop()
		for (let i = 0; i < array.length; i++) {
			if (tag === array[i]) {
				this.selectedItem = i
			}
		}
	},
	methods: {
		// async getTags () {
		//   const { data: res } = await this.$axios.get('http://127.0.0.1:85/api/getArticle')
		//   if (res.code !== 0) {
		//     this.snackbar = true
		//   }
		//   this.items = res.data
		//   var category = this.$route.path.replace('/', '')
		//   for (let i = 0; i < this.items.length; i++) {
		//     if (category === this.items[i]) {
		//       console.log(category)
		//       this.selectedItem = i
		//     }
		//   }
		// }
	},
}
</script>
