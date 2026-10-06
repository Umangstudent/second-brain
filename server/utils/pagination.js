const paginate = async (Model, query, page = 1, limit = 12, sort = { createdAt: -1 }) => {
  const skip = (page - 1) * limit;

  const totalItems = await Model.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const data = await Model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    data,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = { paginate };
