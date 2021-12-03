const dummy = (blogs) => { /* eslint-disable-line no-unused-vars */
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  let favorite = undefined

  for (let blog of blogs) {
    if (favorite) {
      if (blog.likes > favorite.likes) {
        favorite = blog
      }
    }else {
      favorite = blog
    }
  }
  return favorite
}

const mostBlogs = (blogs) => {
  const map = new Map()
  let author = ""
  let maxBlogs = 0

  for (let blog of blogs) {
    if (!map.has(blog.author)) {
      map.set(blog.author, 0)
    }
    map.set(blog.author, map.get(blog.author) + 1)
  }

  for (let [key, value] of map) {
    if (value > maxBlogs) {
      author = key
      maxBlogs = value
    }
  }

  return { author: author, blogs: maxBlogs }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}