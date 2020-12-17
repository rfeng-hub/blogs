<template>
	<div class="article">
		<div class="head">
			<h1 v-text="blog.title"></h1>
			<div class="meta-info">
				<span class="date">
					<i class="iconfont icon-calendar"></i>
					{{ blog.createTime }}
				</span>
				<span class="watch">
					<i class="iconfont icon-eye"></i>
					{{ blog.watch }}
				</span>
			</div>
		</div>
		<mavon-editor
			ref="md"
			v-model="blog.content"
			:toolbarsFlag="false"
			:editable="false"
			defaultOpen="preview"
			:subfield="false"
		/>
		<div class="blog-operation">
			<a :href="'/edit/' + blogId" class="edit">编辑</a>
			<a href="javascript:void(0);" @click="dialog = true" class="delete"
				>删除</a
			>
		</div>
		<v-snackbar v-model="snackbar">
			{{ toastText }}
		</v-snackbar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="290"
			content-class="my-dialog"
		>
			<v-card>
				<v-card-title class="headline">
					确认删除？
				</v-card-title>
				<v-card-actions>
					<v-btn color="green darken-1" text @click="dialog = false">
						取消
					</v-btn>
					<v-btn color="red darken-1" text @click="onDelete">
						删除
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import 'mavon-editor/dist/css/index.css'
export default {
	data() {
		return {
			dialog: false,
			blogId: '',
			blog: {},
			snackbar: false,
			toastText: '获取博客内容失败',
		}
	},
	created() {
		this.blogId = this.$route.params.id
		this.getBlog()
	},
	methods: {
		async getBlog() {
			const { data: res } = await this.$axios.get(`getBlog?id=${this.blogId}`)
			if (res.code !== 0) {
				this.toastText = '获取博客内容失败'
				this.snackbar = true
				return true
			}
			this.blog = res.data
		},
		async onDelete() {
			const { data: res } = await this.$axios.post('deleteBlog', {
				id: this.blogId,
			})
			if (res.code !== 0) {
				this.toastText = '删除博客失败'
				this.snackbar = true
				return true
			}
			location.href = '/'
		},
	},
}
</script>
<style lang="scss" scoped>
.v-overlay--active {
	z-index: 1501;
}
.article {
	position: relative;
	.head {
		text-align: center;
		background-color: #fefefe;
		border-bottom: 1px solid #eee;
		.date {
			margin-right: 20px;
		}
	}
	.markdown-body {
		padding-left: 40px;
		z-index: 200;
		.markdown-content {
			padding: 10px 20px;
			// box-shadow: -4px 0 3px -3px #ccc;
			border-top-left-radius: 4px;
		}
	}
	.v-card__actions {
		justify-content: flex-end;
	}
	.blog-operation {
		background-color: #fff;
		height: 2em;
		line-height: 2em;
		padding-left: 40px;
		.edit {
			margin-right: 10px;
		}
		.delete {
			color: red;
		}
	}
}
</style>
