<template>
	<v-container class="body-container">
		<h3 class="tag">{{ tag }}</h3>
		<v-divider></v-divider>
		<v-row justify="start" align-content="start">
			<template v-for="(article, i) in articles">
				<v-col :key="i" cols="6">
					<h2>
						<router-link :to="'/view/' + type + '/' + article._id">{{
							article.title
						}}</router-link>
					</h2>
					<div class="meta-info">
						<span class="date">
							<i class="iconfont icon-calendar"></i>
							{{ article.createTime }}
						</span>
						<span class="watch">
							<i class="iconfont icon-eye"></i>
							{{ article.watch }}
						</span>
					</div>
					<div class="abstract">{{ article.abstract }}</div>
					<div class="footer-box">
						<span>
							<i class="iconfont icon-tags" v-if="article.tags.length"></i>
							<router-link
								v-for="(tag, j) in article.tags"
								:key="j"
								:to="'/view/' + tag.code"
								>{{
									tag.name + (j === article.tags.length - 1 ? '' : ',')
								}}</router-link
							>
						</span>
					</div>
				</v-col>
			</template>
		</v-row>
		<v-snackbar v-model="snackbar">
			{{ toastText }}
		</v-snackbar>
	</v-container>
</template>
<script>
export default {
	data() {
		return {
			type: '',
			tag: '',
			articles: null,
			tags: {
				new: '最新文章',
				html: 'HTML/CSS',
				javascript: 'JavaScript',
				frame: '前端框架',
				tool: '工具',
			},
			snackbar: false,
			toastText: '获取博客列表失败',
		}
	},
	watch: {
		$route(to, from) {
			if (to.path !== from.path) {
				this.type = to.path.split('/').pop()
				this.tag = this.tags[this.type]
				this.getArticleList(this.type)
			}
		},
	},
	created() {
		this.type = this.$route.path.split('/').pop()
		this.tag = this.tags[this.type]
		this.getArticleList(this.type)
	},
	methods: {
		/**
		 * 获取分类博客列表
		 */
		async getArticleList(tag) {
			const { data: res } = await this.$axios.get(`getBlogList?tag=${tag}`)
			if (res.code !== 0) {
				this.snackbar = true
				return true
			}
			this.articles = res.data
			for (const article of this.articles) {
				for (const i in article.tags) {
					const code = article.tags[i]
					article.tags[i] = { code: code, name: this.tags[code] }
				}
			}
		},
	},
}
</script>
<style lang="scss" scoped>
.body-container {
	padding-left: 40px;
	.tag {
		line-height: 50px;
		height: 50px;
		font-weight: 400;
	}
	h2 {
		font-weight: 400;
		font-size: 24px;
		a {
			color: #000;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
	}
	.meta-info {
		font-size: 12px;
		margin: 10px 0;
		span {
			margin-right: 20px;
			.iconfont {
				font-size: 12px;
			}
		}
	}
	.abstract {
		line-height: 24px;
		text-align: justify;
	}
	.footer-box {
		margin-top: 10px;
		.iconfont.icon-tags {
			margin-right: 10px;
		}
		a {
			margin-right: 4px;
		}
	}
}
</style>
