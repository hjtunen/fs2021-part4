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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}