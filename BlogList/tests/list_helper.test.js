const helper = require('./test_helper')
const listHelper = require('../utils/list_helper')

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    expect(helper.singleBlogPost.likes).toBe(5)
  })

  test('when list has many blogs, equals the likes of all blogs summed', () => {
    const result = listHelper.totalLikes(helper.initialBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('when list has many blogs, favorite blog is one with most likes', () => {
    const answer =   {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    }

    const result  =listHelper.favoriteBlog(helper.initialBlogs)
    expect(result).toEqual(answer)
  })
})

describe('most blog posts by author', () => {
  test('when list has many blogs, return author with most blog posts', () => {
    const result = listHelper.mostBlogs(helper.initialBlogs)
    expect(result).toEqual(
      {
        author: "Robert C. Martin",
        blogs: 3
      }
    )
  })
})

describe('total likes for top author', () => {
  test('when list has many blogs, return author with most likes', () => {
    const result = listHelper.mostLikes(helper.initialBlogs)
    expect(result).toEqual(
      {
        author: "Edsger W. Dijkstra",
        likes: 17
      }
    )
  })
})