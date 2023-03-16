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
}, 10000)


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)  
}, 10000)

test('initial length of blogs is correct', async () => {
  const blogs = await api.get('/api/blogs')
  expect(blogs.body).toHaveLength(helper.initialBlogs.length)
}, 10000)

afterAll(async () => {
  await mongoose.connection.close()
})