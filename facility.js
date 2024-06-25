const Facility = {

    currentData: [],

    changeFloor: (id) => {
        console.log(id);
        $("#carouselExample .carousel-inner .carousel-item").removeClass("active");
        $("#carouselExample .carousel-inner .carousel-item.item-"+ (id + 1)).addClass("active");
        $("#modalToolbarTitle").html(`${id === 0 ? "Tampak Depan" : "Lantai "+ id}`);
    }

}