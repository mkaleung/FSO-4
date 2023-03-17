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

// confirm post creates new blog post
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

// - post increased by one
// - or verify content of blog post saved

afterAll(async () => {
  await mongoose.connection.close()
})