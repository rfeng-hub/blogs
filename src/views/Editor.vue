<template>
	<div id="app">
		<v-form ref="form">
			<v-text-field
				v-model="title"
				:counter="32"
				:rules="titleRule"
				label="标题"
				required
			></v-text-field>
			<v-textarea
				name="input-7-1"
				label="简介"
				v-model="abstract"
				:rules="abstractRule"
			></v-textarea>
			<v-container fluid class="tags">
				<div class="tags-label">标签</div>
				<v-row>
					<v-checkbox v-model="tags.html" label="html" required></v-checkbox>
					<v-checkbox
						v-model="tags.javascript"
						label="javascript"
						required
					></v-checkbox>
					<v-checkbox
						v-model="tags.frame"
						label="前端框架"
						required
					></v-checkbox>
					<v-checkbox v-model="tags.tool" label="工具" required></v-checkbox>
				</v-row>
			</v-container>

			<div style="position:relative;height:36px;margin-bottom: 16px;">
				<v-btn @click="submit" absolute right>
					保存
				</v-btn>
			</div>
		</v-form>
		<mavon-editor ref="md" v-model="article" @imgAdd="$imgAdd" />
		<v-snackbar v-model="snackbar">
			{{ toastText }}
		</v-snackbar>
	</div>
</template>
<script>
export default {
	data() {
		return {
			blogId: '',
			snackbar: false,
			toastText: '请补充博客内容',
			article: '',
			title: '',
			titleRule: [
				(v) => !!v || 'Title is required',
				(v) => v.length <= 32 || 'Name must be less than 32 characters',
			],
			abstractRule: [(v) => !!v || 'Abstract is required'],
			abstract: '',
			tags: {
				html: false,
				javascript: false,
				frame: false,
				tool: false,
			},
		}
	},
	created() {
		this.blogId = this.$route.params.id
		if (this.blogId) {
			this.initBlog()
		}
	},
	methods: {
		async initBlog() {
			const { data: res } = await this.$axios.get(`getBlog?id=${this.blogId}`)
			if (res.code !== 0) {
				this.toastText = '获取博客内容失败'
				this.snackbar = true
				return true
			}
			this.title = res.data.title
			this.abstract = res.data.abstract
			for (let key of res.data.tags) {
				this.tags[key] = true
			}
			this.article = res.data.content
		},
		dateFormat(date) {
			return `${date.getFullYear()}-${
				date.getMonth() + 1 >= 10
					? date.getMonth() + 1
					: '0' + (date.getMonth() + 1)
			}-${date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()} ${
				date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()
			}:${
				date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
			}:${
				date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds()
			}`
		},
		// onSave(value, render) {
		// 	this.article = render
		// },
		// onChange(value, render) {
		// 	this.article = render
		// },
		submit() {
			if (this.$refs.form.validate()) {
				if (this.article) {
					this.saveBlog()
				} else {
					this.toastText = '请补充博客内容'
					this.snackbar = true
				}
			}
		},
		async saveBlog() {
			var params = {
				title: this.title,
				abstract: this.abstract,
				tags: [],
				createTime: this.dateFormat(new Date()),
				watch: 0,
				content: this.article,
			}
			for (let tag in this.tags) {
				if (this.tags[tag]) {
					params.tags.push(tag)
				}
			}
			var Interface = ''
			if (this.blogId) {
				Interface = 'updateBlog'
				params._id = this.blogId
			} else {
				Interface = 'saveBlog'
			}
			console.log(params)
			const { data: res } = await this.$axios.post(Interface, params)
			if (res.code !== 0) {
				this.toastText = '保存博客失败'
				this.snackbar = true
				return true
			}
			location.href = '/'
		},
		$imgAdd(pos, $file) {
			// 第一步.将图片上传到服务器.
			var formdata = new FormData()
			formdata.append('file', $file)
			this.$axios({
				url: 'upload',
				method: 'post',
				data: formdata,
				headers: { 'Content-Type': 'multipart/form-data' },
			}).then((res) => {
				// 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
				/**
				 * $vm 指为mavonEditor实例，可以通过如下两种方式获取
				 * 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
				 * 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
				 */

				this.$refs.md.$img2Url(pos, res.data.files[0].url)
			})
		},
	},
}
</script>
<style lang="scss" scoped>
#app {
	padding: 50px;
	.tags {
		.tags-label {
			margin-left: -12px;
			color: rgba(0, 0, 0, 0.6);
		}
		.v-input--checkbox {
			margin-right: 20px;
		}
	}
}
</style>
