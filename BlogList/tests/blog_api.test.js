const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
}, 100000)


test('blogs are returned as json', async () => {
  await api
  .get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)  
}, 100000)

test('initial length of blogs is correct', async () => {
  const blogs = await api.get('/api/blogs')
  expect(blogs.body).toHaveLength(helper.initialBlogs.length)
}, 100000)

test("confirm id's are defined on a random blog post", async () => {
  const blogs = await api.get('/api/blogs')
  const randomBlog = Math.floor(Math.random() * helper.initialBlogs.length)
  expect(blogs.body[randomBlog].id).toBeDefined()
})

test('confirm HTTP POST creates new blog post', async () => {
  await api
  .post('/api/blogs')
  .send(helper.singleBlogPost)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const blogsContent = blogsAtEnd.map(blog => blog.content)
  expect(blogsContent).toContain(helper.singleBlogPost.content)
})

test('confirm likes default to 0 if not specified', async () => {
  let postWithoutLikes = Object.assign({}, helper.singleBlogPost)
  delete postWithoutLikes.likes

  await api
  .post('/api/blogs')
  .send(postWithoutLikes)
  .expect(201)
  .expect('Content-Type', /application\/json/)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
})

// test to confirm 400 status if title or url missing
test('confirm posts without title or url returns status 400', async () => {
  let postWithoutTitle = Object.assign({}, helper.singleBlogPost)
  delete postWithoutTitle.title

  await api
  .post('/api/blogs')
  .send(postWithoutTitle)
  .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})