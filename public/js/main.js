
$("#paging").pagination({
  dataSource: "http://localhost:3000/user?page=1",
  locator: "data",
  totalNumberLocator: function (respone) {
    return respone.total;
  },
  pageSize: 2,

  
  afterPageOnClick: function (event, pageNumber) {
    LoadPage(pageNumber);
  },

  afterPreviousOnClick: function (event, pageNumber) {
    console.log("Prev clicked, page:", pageNumber);

    LoadPage(pageNumber);
  },

  afterNextOnClick : function (event, pageNumber) {
     console.log("Prev clicked, page:", pageNumber);
    LoadPage(pageNumber);
  }
});

function LoadPage(page) {
  $("#content").html("");
  $.ajax({
    url: "/user?page=" + page,
    type: "GET",
  })
    .then((res) => {
      console.log(res.totalPages);
      res.data.forEach((element) => {
        var item = $(`<h3>${element.username}</h3>`);
        $("#content").append(item);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

LoadPage(1);
