const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const helper = require("./test_helper")
const User = require("../models/user")
const api = supertest(app)
const Blog = require("../models/blog")
const bcrypt = require("bcrypt")
var token = null

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash("sekret", 10)
  const user = new User({ username: "root", passwordHash })

  await user.save()

  const response = await api.post("/api/login").send({ username: "root", password: "sekret" })
  //console.log(response)
  token = `bearer ${response.body.token}`
  //console.log(token)

  const users = await User.find({})
  //console.log(users)
  const id = users[0]._id

  const blogsToAdd = helper.initialBlogs.map(blog => {
    blog.user = id
    return blog
  })
  //console.log(blogsToAdd)

  await Blog.deleteMany({})
  await Blog.insertMany(blogsToAdd)
})

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs")

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test("id is defined", async () => {
  const response = await api.get("/api/blogs")

  expect(response.body[0].id).toBeDefined()
})

test("a specific blog is within the returned blogs", async () => {
  const response = await api.get("/api/blogs")

  const contents = response.body.map(r => r.title)

  expect(contents).toContain(
    "React patterns"
  )
})

describe("inserting a blog", () => {
  test("inserting a blog increases the amount of blogs by one", async () => {
    const blog = { title: "title", author: "author", url: "url", likes: 0 }
    await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const response = await api.get("/api/blogs")
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  })

  test("likes default to 0", async () => {
    const blog = { title: "title", author: "author", url: "url" }
    const response = await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(blog)
      .expect(201)

    expect(response.body.likes).toBeDefined()
    expect(response.body.likes).toBe(0)
  })

  test("title has to exist", async () => {
    const blog = { author: "author", url: "url", likes: 0 }
    await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(blog)
      .expect(400)
  })

  test("url has to exist", async () => {
    const blog = { title: "title", author: "author", likes: 0 }
    await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(blog)
      .expect(400)
  })

  test("inserting a blog doesn't work without token", async () => {
    const blog = { title: "title", author: "author", url: "url", likes: 0 }
    await api
      .post("/api/blogs")
      .send(blog)
      .expect(401)
      .expect("Content-Type", /application\/json/)

    const response = await api.get("/api/blogs")
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe("viewing a blog by id", () => {
  test("succeeds with a valid id", async () => {
    const blogs = await helper.blogsInDb()
    const blogToView = blogs[0]

    const result = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)

    expect(result.body.title).toBe(blogToView.title)
  })
  test("fails with 404 if blog does not exist", async () => {
    const nonId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${nonId}`)
      .expect(404)
  })
})

describe("deletion of a blog", () => {
  test("succeeds with 204 if valid id", async () => {
    const blogs = await helper.blogsInDb()
    const blogToDelete = blogs[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", token)
      .expect(204)
  })
})

describe("modifying a blog", () => {
  test("the amount of likes changes", async () => {
    const blogs = await helper.blogsInDb()
    let blogToModify = blogs[0]
    blogToModify.likes = 999

    const result = await api
      .put(`/api/blogs/${blogToModify.id}`)
      .send(blogToModify)
      .expect(200)

    expect(result.body.likes).toBe(999)
  })
})

afterAll(() => {
  mongoose.connection.close()
})