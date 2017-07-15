const getPrettyObjectString = (object, separator) =>
  Object.keys(object)
    .map(key => `${key}: ${object[key]}`)
    .join(separator)

exports.getPrettyObjectString = getPrettyObjectString
