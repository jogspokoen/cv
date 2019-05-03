var global_binded = true;
var new_attributes_tab_active = false;
var is_generic = false;
var family_id;
var family_name;
var show_all = 0;
km = {
    37: function () {
        console.log('LEFT')
        activate_tab('old');
    },
    39: function () {
        console.log('RIGHT');
        activate_tab('new');
    },
    65: save,
    71: switch_generic,
    69: function () {
        console.log('E');
        if (new_attributes_tab_active) {
            global_binded = false;
            activate_tab('new');
            $('#searchbar').focus();
        }
    },
    13: function () {
        console.log('ENTER');
        if(global_binded){
            // km['num'](0);
        }
    },
    32: function () {
        console.log('SPACE');
    },
    83: show_processed,
    72: hide_processed,
    'num': function (num) {
        if(new_attributes_tab_active){
            row = $('#attribute_tab_new .can_see_attr').eq(num);
            switch_for_new_attr_row(row);
        }else{
            row = $('#attribute_tab_old .can_see_attr').eq(num);
            choose_old(row);
        }

    }
}
kd = {
    38: function () {

    },
    40: function () {

    },
}

$(document).ready(function () {
    // variables
    csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
    family_id = $('#family_id').val();
    family_name = $('#family_name').val();
    show_all = $('#show_all').val();

    // Settings
    jQuery.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

    //Actions
    row = $('#attribute_tab_old .can_see_attr').eq(0);
    choose_old(row);

    // Global listeners
    $(document).keyup(function (ev) {
        if (global_binded) {
            code = ev.which;
            if (code in km) {
                km[code]();
            } else if (code >= 48 && code <= 57) {
                km['num'](code - 48);
            } else {
                // console.log(code);
            }
        }
    });
    $(document).keydown(function (ev) {
       if(ev.which in kd){
           console.log('UPDAOW');
       }
    });

    // search bar
    $('#searchbar').keyup(function (ev) {
        // Enter will unfocus search bar
        t = $(this).val();
        if (t.length > 0) {
            rows = $('#attribute_tab_new tr[data-an^="' + t + '"]').add($('#attribute_tab_new tr[data-av^="' + t + '"]'));
        } else {
            rows = $('#attribute_tab_new tr.new_attr_p');
        }
        set_table_numbers(rows);

        if (ev.which == 13) {
            $(this).blur();
            if(rows.length == 1){
                km['num'](0);
            }
        }
    });
    $('#searchbar').focusout(function () {
        global_binded = true;
    });

    jQuery('.is-generic').on('click', switch_generic)
    jQuery('.accept-sugestion').on('click', save)
    jQuery('.show-processed').on('click', show_processed)
    jQuery('.hide-processed').on('click', hide_processed)

    $('#attribute_tab_new .can_see_attr a.btn').on('click', function () {
        new_attr_row = $(this).closest('.can_see_attr');
        switch_for_new_attr_row(new_attr_row)
        return false;
    });
    $('#attribute_tab_old a.btn').on('click', function () {
        old_attr_row = $(this).closest('.can_see_attr');
        choose_old(old_attr_row)
        return false;
    });
    $(document).on('click', '#new_attr_current .can_see_attr a.btn', function () {
        row_for_deselection = $(this).closest('.can_see_attr');
        deselect_row(row_for_deselection.data('an'), row_for_deselection.data('av'))
        return false;
    });
});

function choose_old(row) {
    $('#attribute_tab_old .can_see_attr').removeClass('attr_selected');
    $('#old_attr_current').empty();

    row_c = row.clone();
    row_c.find('td').eq(0).remove();
    $('#old_attr_current').append(row_c);
    row.addClass('attr_selected');

    $('#new_attr_current').empty();

    activate_tab('new');

    if(row.data('s-an')){
        // we have suggestion or already mapped attr
        new_row_matched_with_already_mapped = $('#attribute_tab_new tr[data-an^="' + row.data('s-an') + '"][data-av^="' + row.data('s-av') + '"]');
        // what if already mapped was generic? then we go generic globally
        if(row.data('s-ag') == 'y'){
            is_generic = true;
            jQuery('.is-generic').addClass('is-generic-active');
        }else{
            is_generic = false;
            jQuery('.is-generic').removeClass('is-generic-active');
        }
        $('#attribute_tab_new tr').removeClass('attr_selected');
        switch_for_new_attr_row(new_row_matched_with_already_mapped);
    }else{
        // no suggestion, search bar instead
        global_binded = false;
        $('#searchbar').focus();
    }

}
function switch_for_new_attr_row(row) {
    row.toggleClass('attr_selected');
    row_clone = row.clone();
    row_clone.removeClass('attr_selected');
    hidden_class = is_generic ? '' : 'd-none';
    row_clone.find('td').eq(0).html('<button class="btn btn-success button-generic '+hidden_class+'">G</button>');
    if(row.hasClass('attr_selected')){
        // add
        $('#new_attr_current').prepend(row_clone);
    }else{
        //remove
        deselect_row(row.data('an'), row.data('av'))
    }
}

function deselect_row(n, v){
    $('#new_attr_current tr[data-an^="' + n + '"]tr[data-av^="' + v + '"]').remove();
    $('#attribute_tab_new tr[data-an^="' + n + '"]tr[data-av^="' + v + '"]').removeClass('attr_selected');
}

function switch_generic() {
    is_generic = is_generic ? false : true;
    button_generic = jQuery('.is-generic');
    button_generic.toggleClass('is-generic-active');

    flag_generic = $('#new_attr_current .button-generic')
    if(is_generic) {
        flag_generic.removeClass('d-none');
        button_generic.text('Generic [ G ]')
    }else{
        flag_generic.addClass('d-none');
        button_generic.text('Product-specific [ G ]')
    }
}

function set_table_numbers(rows) {
    $('#attribute_tab_new tr.new_attr_p').hide();
    $('#attribute_tab_new tr.new_attr_p').removeClass('can_see_attr');

    rows.show();
    rows.addClass('can_see_attr');

    rows.each(function (index) {
        $(this).find('td').eq(0).text(index);
    })
}

function activate_tab(tab_type) {
    other_tab = (tab_type == 'old') ? 'new' : 'old';
    $('.attribute_tab').removeClass('attribute_tab_disabled');
    $('#attribute_tab_' + other_tab).addClass('attribute_tab_disabled')
    new_attributes_tab_active = (tab_type == 'new');
}

function show_processed() {
    document.location = document.location.origin + document.location.pathname + '?old_all=1&fid=' + family_id;
    return false;
}

function hide_processed() {
    document.location = document.location.origin + document.location.pathname + '?fid=' + family_id;
    return false;
}

function save () {
    console.log('A');
    old = $('#old_attr_current tr').eq(0);
    backend_data = {
        family_id: $('#family_id').val(),
        family_name: $('#family_name').val(),
        old_name: old.data('an'),
        old_val: old.data('av'),
        new_av: [],
        is_generic: is_generic
    }

    $('#new_attr_current tr').each(function(){
        _this = $(this);

        backend_data.new_av.push({
            n: _this.data('an'),
            v: _this.data('av'),
            t: _this.data('at'),
            aoid: _this.data('aid')
        });
    });
    if(backend_data.new_av.length>0){
        console.log(backend_data);
        $('#exampleModal').modal();
        $.ajax({
            method: "POST",
            url: "/v1/pp/",
            data: JSON.stringify(backend_data),
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            success: function (r) {
                // refresh page
                console.log(r);
                document.location.reload();
            }
        })
    }

}