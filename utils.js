const getPrettyObjectString = (object, separator = '\n') =>
  Object.keys(object)
    .map(key =>
    `${key}: ${object[key]}`
    ).join(separator)

exports.getPrettyObjectString = getPrettyObjectString