self.addEventListener('install', evt =>{
    console.log("Insatlled")
});

self.addEventListener('activate', evt =>{
    console.log("activate")
});

self.addEventListener('fetch', evt =>{
    // console.log(evt)
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MESSAGE_IDENTIFIER') {
        //http://www.youtube.com/get_video_info?video_id=EKdAU3l_0gA&el=embedded&ps=default&eurl=&gl=US&hl=en
    //   console.log(event.data)
    //   fetch("https://www.youtube.com/watch?v=EKdAU3l_0gA").then((data) =>{
    //     console.log(data)
    // }).catch(err => {
    //       console.log(err)

    //   })

    //   fetch("http://www.youtube.com/watch?v=EKdAU3l_0gA" /*, options */)
    //     .then((response) => response.text())
    //     .then((html) => {
    //         //document.getElementById("content").innerHTML = html;
    //         console.log(777777777)
    //     })
    //     .catch((error) => {
    //         console.warn(error);
    //         console.log(88888888888)
    //     });

      

      

    }
  });