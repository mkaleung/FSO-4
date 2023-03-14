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

module.exports = {
  totalLikes,
  favoriteBlog
}