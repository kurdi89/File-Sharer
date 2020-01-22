jQuery(document).ready(async() => {
    // Socket.io :
    const socket = await io('localhost:5001');

    socket.on('list', (data)=>{
        console.log('data :', data)
        // toast :
        $('#toast-msg').text(data.length + ' files found to be shared');
        $('#toast').toast('show');
    })


    // Fetch ngrok URL from API Route : /link
    async function getLink() {
        const res = await fetch('/link');
        const data = await res.json();
        return data.data
    }
    const url = await getLink()
    await $('#public-url').text(url)
    console.log('url: ', url)

    /** Fetching data */
    // Fetch data from API
    async function getData() {
        const res = await fetch('/api/v1/data');
        const response = await res.json();
    
        const data = response.data.map(file => { // not needed unless you need to modify it
            // return {
            //     file // as object
            // };
            return file;
        });
        return data
    }
    var files = await getData();
    console.log('files :', files)
    
    // viewable extentions : 
    viewables = ['txt', 'json', 'png', 'jpeg'];

    /**Appending files */
    // append files on the page : 
    await files.forEach(async file => {
        let name, id, extention, view, download;
        id = file.id;
        name = file.name;
        link = url + '/share/' + id;

        file.name.split('.').pop() ? extention = file.name.split('.').pop() : extention = undefined
        viewables.includes(extention) ? view = `<a href="${link}/v" target="_blank">view</a> |` : view = '' // viewable extentions (use only with trusted sources)
        
        var icon = `<div class="card-img-top">
                        <div class="fi fi-${extention} fi-size-x">
                            <div class="fi-content fi-size-x">${extention}</div>
                        </div>
                    </div>`
        var div = `
        <div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-2 code" id="${id}">
            <div class="card m-1 mx-auto" style="width: 14rem;">
                <div class="card-body p-2">
                <div class="row w-100 m-0">
                    <div class="col-sm-3 p-0">${icon}</div>
                    <div class="col p-0">
                    <p class="card-text m-0"><small class="text-muted">${name}</small></p>
                    <p class="card-text text-right m-0"><small class="text-muted">${view} <a href="${link}/d">download</a></small></p>
                    </div>
                </div>
                </div>
            </div>
        </div>
        `;
        $('#cards').append(div);
    });

    socket.on('downloading', (data)=>{
        console.log('data :', data)
        // toast :
        $('#toast-msg').text(`downloading file : ${data.name}`);
        $('#toast').toast('show');
    })



    // handling toasts :
    var options = {
        animation : true,
        autohide : true,
        // autohide : false,
        delay : 3000
    }
    $('.toast').toast(options)


})

