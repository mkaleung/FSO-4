const totalLikes = (blogs) => {
  let sumLikes = 0

  for (i = 0; i < blogs.length; i++) {
    sumLikes += blogs[i].likes
  }

  return sumLikes
}

module.exports = {
  totalLikes
}