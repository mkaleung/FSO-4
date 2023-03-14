const totalLikes = (blogs) => {
  let sumLikes = 0

  for (i = 0; i < blogs.length; i++) {
    sumLikes += blogs[i].likes
  }

  return sumLikes
}

const favoriteBlog = (blogs) => {
  let favorite = 0
  let maxLikes = 0

  for (i = 0; i < blogs.length; i++) {
    if (blogs[i].likes > maxLikes) {
      maxLikes = blogs[i].likes;
      favorite = i
    }
  }

  return blogs[favorite]
}

const mostBlogs = (blogs) => {
  let dict = {}

  for (i = 0; i < blogs.length; i++) {
    if (dict[blogs[i].author]) {
      dict[blogs[i].author] += 1
    } else {
      dict[blogs[i].author] = 1
    }
  }

  const author = Object.keys(dict).reduce((a, b) => dict[a] > dict[b] ? a : b)
  const answer = {
    "author": author,
    "blogs" : dict[author]
  }
  
  return answer
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs
}