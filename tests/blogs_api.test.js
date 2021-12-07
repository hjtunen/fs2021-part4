const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const helper = require("./test_helper")

const api = supertest(app)
const Blog = require("../models/blog")

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

test("inserting a blog increases the amount of blogs by one", async () => {
  const blog = { title: "title", author: "author", url: "url", likes: 0 }
  await api
    .post("/api/blogs")
    .send(blog)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  const response = await api.get("/api/blogs")
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
})

test("likes default to 0", async () => {
  const blog = { title: "title", author: "author", url: "url" }
  const response = await api.post("/api/blogs").send(blog).expect(201)

  expect(response.body.likes).toBeDefined()
  expect(response.body.likes).toBe(0)
})

test("title has to exist", async () => {
  const blog = { author: "author", url: "url", likes: 0 }
  await api.post("/api/blogs").send(blog).expect(400)
})

test("url has to exist", async () => {
  const blog = { title: "title", author: "author", likes: 0 }
  await api.post("/api/blogs").send(blog).expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})