const fetchQuotes = async () => {
  const res = await axios.get("/api/v1/admin/quotes", {
    params: {
      page: 1,
      limit: 10,
      status: "Pending",
      sort: "-createdAt"
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  setData(res.data.data)
}