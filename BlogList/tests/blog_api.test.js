const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const { userExtractor } = require('../utils/middleware')

beforeAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'initialuser', name:'Test User', passwordHash })
  const savedUser= await user.save()

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    blogObject.user = savedUser.id
    await blogObject
      .save()
  }
}, 100000)

describe('tests where login isnt required', () => {
  test('blogs are returned as json', async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)  
  })

  test('initial length of blogs is correct', async () => {
    const blogs = await api.get('/api/blogs')
    expect(blogs.body).toHaveLength(helper.initialBlogs.length)
  })

  test("confirm id's are defined on a random blog post", async () => {
    const blogs = await api.get('/api/blogs')
    const randomBlog = Math.floor(Math.random() * helper.initialBlogs.length)
    expect(blogs.body[randomBlog].id).toBeDefined()
  })

  test('confirm likes can be updated with HTTP put', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    
    let updatedBlog = Object.assign({}, blogToUpdate)
    updatedBlog.likes = 200
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd[0].likes).toBe(updatedBlog.likes)
  })
})

describe('tests where login is required', () => {
  test('confirm HTTP POST creates new blog post', async () => {
    const login = await api
    .post('/api/login')
    .send({"username": "initialuser", "password": "secret"}) 

    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${login._body.token}`)
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
    
    const login = await api
    .post('/api/login')
    .send({"username": "initialuser", "password": "secret"})
    
    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${login._body.token}`)
    .send(postWithoutLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
  })

  test('confirm posts without title or url returns status 400', async () => {
    let blogsAtStart = await helper.blogsInDb()
    
    let postWithoutTitle = Object.assign({}, helper.singleBlogPost)
    delete postWithoutTitle.title
    
    let postWithoutUrl = Object.assign({}, helper.singleBlogPost)
    delete postWithoutUrl.url
  
    const login = await api
    .post('/api/login')
    .send({"username": "initialuser", "password": "secret"})
  
    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${login._body.token}`)
    .send(postWithoutTitle)
    .expect(400)
  
    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${login._body.token}`)
    .send(postWithoutUrl)
    .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)
  })

  test('confirm posts with specific id can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    const login = await api
    .post('/api/login')
    .send({"username": "initialuser", "password": "secret"})
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${login._body.token}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(
      blogsAtStart.length - 1
    )
  
    const ids = blogsAtEnd.map(r => r.id)
  
    expect(ids).not.toContain(blogToDelete.id)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('supersecret', 10)
    const user = new User({ username: 'root', name:'Test User', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'initialUser',
      name: 'Test User',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Test User',
      password: 'supersecret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails if username and/or password is less than 3 in length', async () => {
    const usersAtStart = await helper.usersInDb()

    const userWithInvalidUsername = {
      username: 'ro',
      name: 'Test User',
      password: 'supersecret',
    }
    
    const userWithInvalidPassword = {
      username: 'roost',
      name: 'Test User',
      password: 't',
    }

    const resultInvalidUsername = await api
      .post('/api/users')
      .send(userWithInvalidUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(resultInvalidUsername.body.error).toContain('shorter than the minimum allowed length (3).')

    const resultInvalidPassword = await api
      .post('/api/users')
      .send(userWithInvalidPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(resultInvalidPassword.body.error).toContain('Password must be at least 3 characters long')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})