$(document).ready(function() {
    $("i.glyphicon-thumbs-up, i.glyphicon-thumbs-down").click(function() {
        var $this = $(this);
        // ref: https://api.jquery.com/data/
        c = $this.data("count");
        cur_id = this.id
        console.log(this.id);

        if (!c) {
            // ref: https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
            // get likes
            $.get("/get_likes", { id: cur_id },
                function(res, status) {
                    console.log("get likes request...");
                    console.log("image likes: " + res.likes);
                    c = res.likes;
                    c++;
                    console.log(c);
                    $this.data("count", c);
                    $("#" + cur_id + "-count").html(c);

                    $.post("/update_likes", {
                        id: cur_id,
                        likes: c
                    });
                });
        } else {
            c++;
            console.log(c);
            $this.data("count", c);
            $("#" + this.id + "-count").html(c);
            $.post("/update_likes", {
                id: cur_id,
                likes: c
            });
        }

    });
    $(document).delegate('*[data-toggle="lightbox"]', "click", function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
});