var scrolling = true;
function initApp(apiUrl) {
  //clean
  localStorage.clear();
  // setting signup
  initHTML();  
  initLogin(apiUrl);
  initSignup(apiUrl); 
  //setting  nav
  setupNavButton();
  setupNav(apiUrl);
  //setting post
  setupPost(apiUrl);
  initUserPage(apiUrl);
  //load data 
  loadPublicPosts(apiUrl);

  //infiniti scroll
  window.addEventListener('scroll',(event) => {
    if (scrolling == true && (window.innerHeight + window.scrollY)+100>= document.body.scrollHeight&&window.localStorage.getItem('token') ) {
      scrolling = false;
      //console.log("Bottom of page");
      loadmoreUserFeed(apiUrl);
    }
  });
}













function loadPublicPosts(apiUrl){
  var data = fetchData(apiUrl+"/post/public",{method: 'GET'});
  data.then(function(data) {
    let posts = data['posts'];
    const cur_posts = document.getElementById('feed');
    for(var i = 0;i<posts.length;i++){
      let tmp = buildPost(data['posts'][i],apiUrl);
      cur_posts.appendChild(tmp);
      //console.log(tmp);
    }
  })
}

function signup(apiUrl,payload){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  let options = {
    method: 'POST',
    headers:headers,
    body: JSON.stringify(payload)
  }

  var data = fetchData(apiUrl+"/auth/signup",options);
  data.then((response)=>{
    if(response){
      window.localStorage.setItem('username', document.getElementById('username').value);
      window.localStorage.setItem('token', response['token']);
      setTimeout(()=>{
        let signup_background = document.getElementById('signup_background');
        signup_background.style.display = "none";
        document.getElementById('user_icon').style.display = "inline-block";
        document.getElementsByClassName("nav-item")[1].style.display = "none";
        document.getElementsByClassName("nav-item")[2].style.display = "none";
      },1000); 
      loadUserFeed(apiUrl);
      document.getElementById('logout').style.display = "inline-block";
    }
  })
}

function getPostByID(id,apiUrl){
  let headers = {
    'Accept': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  var data = fetchData(apiUrl+"/post/?id="+id,{method: 'GET','headers':headers});
  data.then(function(data) {

      let total_vote = parseInt(document.getElementById('total vote').textContent.split(':')[1]);
      total_vote+=data['meta']['upvotes'].length;
      document.getElementById('total vote').textContent = "Vote:"+total_vote;
      const edit_button = document.createElement("img");
      edit_button.className = 'edit2';
      edit_button.src = 'src/edit.png';
      let cur_user = window.localStorage.getItem('username');
      edit_button.addEventListener('click',(event)=>{
        let box = document.getElementById('post_modal_box_userpage');
        box.style.display = 'block';
        let title = event.target.parentElement.childNodes[0].textContent;
        let text = event.target.parentElement.childNodes[1].textContent;
        box.setAttribute('pid',event.target.parentElement.getAttribute('pid'));
        box.childNodes[1].value = title;
        box.childNodes[2].value = text;
        window.localStorage.removeItem('img');
        if(event.target.parentElement.childNodes.length == 4){
          window.localStorage.setItem('img',event.target.parentElement.childNodes[2].src);
        }
      })
      let author = data['meta']['author'];
      if(author != cur_user){
        edit_button.style.visibility = 'hidden';
      }
      let post = document.createElement('div');
      post.setAttribute('pid',id);
      post.className = 'userpage_post';
      let title = document.createElement('p');
      if(data['title']){
        title.textContent = data['title'];
      }else{
        title.textContent = "null";
      }
      
      title.className = 'post-title alt-text';
      let text = document.createElement('p');
      text.textContent = data['text'];
      text.className = 'content_text';
      post.appendChild(title);
      post.appendChild(text);


      if(data['image']){
        let img = document.createElement('img');
        img.src = 'data:image;base64,'+data['image'];
        img.style.width = '100%';
        post.appendChild(img);
      }
      post.appendChild(edit_button);

      document.getElementById('userpage_posts').appendChild(post);
  })
}





function getUserByID(id,apiUrl){
  let headers = {
    'Accept': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  var data = fetchData(apiUrl+"/user/?id="+id,{method: 'GET','headers':headers})
    .then((data)=>{
        let username = data['username'];
        let username_div = document.createElement('div');
        let username_tag = document.createElement("p");
        username_tag.textContent = "@"+username;
        username_tag.style.display = "inline-block";
        username_tag.style.width = "50%";
        //username_tag.className ="following_username";
        let unfollow = document.createElement("p");
        unfollow.className = "button button-third";
        unfollow.textContent = "x";
        unfollow.style.display = "inline-block";
        username_div.appendChild(username_tag);
        username_div.appendChild(unfollow)
        username_div.style.display = "inline-block";
        username_div.style.padding = '2px';
        username_div.className = "username_div";
        unfollow.addEventListener('click',(event)=>{
          let headers = {
            'Accept': 'application/json',
            'Authorization': 'Token ' + window.localStorage.getItem('token')
          };
          let username = event.target.parentElement.childNodes[0].textContent.split('@')[1];
          if(username){
            var data = fetchData(apiUrl+"/user/unfollow?username="+username,{method: 'PUT','headers':headers})
            .then(()=>{
              userPofile(apiUrl).then((response)=>{
                loadProfile(response,apiUrl);
              });
            })
          }
        });
        let following_inner_box = document.getElementById('following_inner_box');
        following_inner_box.appendChild(username_div);
    })
}

function loadProfile(data,apiUrl){
  document.getElementById('userpage_username').textContent = data['username'];
  document.getElementById('userpage_email').textContent = data['email'];
  document.getElementById('userpage_name').textContent = data['name'];
  document.getElementById('Following').textContent = "Following:"+data['following'].length;
  document.getElementById('Followed').textContent = "Followed:"+data['followed_num'];
  document.getElementById('total vote').textContent = "Vote:0";
  const post_list = data['posts'];
  const following = data['following'];
  document.getElementById('post_counter').textContent = "Post:"+post_list.length;
  var posts = document.getElementById('userpage_posts');
  if(data['username'] != window.localStorage.getItem('username')){
    document.getElementsByClassName('modal_follow')[0].style.display = "none";
  }else{
    document.getElementsByClassName('modal_follow')[0].style.display = "block";
  }

  while(posts.childNodes[0]){
    posts.removeChild(posts.childNodes[0]);
  }
  while(following_inner_box.childNodes[0]){
    following_inner_box.removeChild(following_inner_box.childNodes[0]);
  }
  for(let i = 0;i<post_list.length;i++){
    //console.log("post id:"+post_list[i]);
    getPostByID(post_list[i],apiUrl);
  }
  for(let i = 0;i<following.length;i++){
    getUserByID(following[i],apiUrl);
  }
}

function userPofile(apiUrl){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  var data = fetchData(apiUrl+"/user",{method: 'GET',headers:headers});
  return data;
}
function userPofile2(apiUrl,username){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  var data = fetchData(apiUrl+"/user?username="+username,{method: 'GET',headers:headers});
  return data;
}

function login(apiUrl,payload){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  let options = {
    method: 'POST',
    headers:headers,
    body: JSON.stringify(payload)
  }

  //console.log(options);
  var data = fetchData(apiUrl+"/auth/login",options);
  data.then((response)=>{
    if(response){
      window.localStorage.setItem('username', document.getElementById('login_username').value);
      //console.log(document.getElementById('username').value);
      window.localStorage.setItem('token', response['token']);
      loadUserID(apiUrl);
      loadUserFeed(apiUrl);
      setTimeout(()=>{
        let login_background = document.getElementById('login_background');
        login_background.style.display = "none";
        document.getElementById('logout').style.display = "inline-block";
        document.getElementById('user_icon').style.display = "inline-block";
        document.getElementsByClassName("nav-item")[1].style.display = "none";
        document.getElementsByClassName("nav-item")[2].style.display = "none";
      },700); 
    }
  })
}
function loadUserID(apiUrl){
  let headers = {
    'Accept': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  let url = apiUrl+"/user/";
  var data = fetchData(url,{method: 'GET',headers:headers});
  data.then(function(data) {
    //console.log("id:"+data['id']);
    window.localStorage.setItem('id', data['id']);
  })
}

function loadUserFeed(apiUrl){
  //console.log("feed");
  //console.log(window.localStorage.getItem('token'));
  let headers = {
    'Accept': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  let url = apiUrl+"/user/feed?p=0&n=3";
  var data = fetchData(url,{method: 'GET',headers:headers});
  data.then(function(data) {
    let posts = data['posts'];
    const cur_posts = document.getElementById('feed');
    for(;cur_posts.childNodes.length > 1;){
        cur_posts.removeChild(cur_posts.childNodes[1]);
    }
    //console.log(cur_posts);
    for(var i = 0;i<posts.length;i++){

      let tmp = buildPost(data['posts'][i],apiUrl);
      cur_posts.appendChild(tmp);
    }
  })
}

function loadmoreUserFeed(apiUrl){
  const cur_posts = document.getElementById('feed');
  let start = cur_posts.childNodes.length-1;
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  let url = apiUrl+"/user/feed"+"?p="+start+"&n=3";
  var data = fetchData(url,{method: 'GET',headers:headers});
  data.then(function(data) {
    let posts = data['posts'];
    //console.log(data['posts']);
    for(var i = 0;i<posts.length;i++){
      let tmp = buildPost(data['posts'][i],apiUrl);
      cur_posts.appendChild(tmp);
      //console.log(tmp);
    }
  }).then(()=>{
    scrolling = true;
  })
}

function upvote(apiUrl,id){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  let url = apiUrl+"/post/vote"+'?id='+id;
  var data = fetchData(url,{method: 'PUT',headers:headers});
  data.then(function(data) {
    //console.log(data);
  })
}

function deleteVote(apiUrl,id){
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + window.localStorage.getItem('token')
  };
  let url = apiUrl+"/post/vote"+'?id='+id;
  var data = fetchData(url,{method: 'DELETE',headers:headers});
  data.then(function(data) {
    //console.log(data);
  })
}

function buildPost(data,apiUrl){

  const data_id_post = document.createElement("li");
  data_id_post.className = 'post';
  data_id_post.setAttribute("data-id-post",'');
  const data_id_upvotes = document.createElement("div");
  data_id_upvotes.className = 'vote';
  //data_id_upvotes.setAttribute('data-id-upvotes','')
  //data_id_upvotes.setAttribute("data-id-upvotes",'');
  const upvote_img = document.createElement("img");
  var upvote_div = document.createElement("div");
  upvote_div.style.display = 'none';
  upvote_div.className = "upvote_div";
  if(window.localStorage.getItem('id')){
    let tmp = 0;
    let id = window.localStorage.getItem('id');
    let upvote = data['meta']['upvotes'];
    for(let i = 0;i< upvote.length;i++){
      //console.log(upvote[i]);
      if(upvote[i] == id){
        tmp = 1
      }else{
        let headers = {
          'Accept': 'application/json',
          'Authorization': 'Token ' + window.localStorage.getItem('token')
        };
        fetchData(apiUrl+"/user/?id="+upvote[i],{method: 'GET','headers':headers})
          .then((result)=>{
              let username = document.createElement("p");
              username.textContent = result['username'];
              upvote_div.appendChild(username);
          })
      }
    }
    if (tmp == 1){
      upvote_img.src = 'src/upvote2.png';
    }else{
      upvote_img.src = 'src/upvote-512.png';
    }
  }else{
    upvote_img.src = 'src/upvote-512.png';
  }
  upvote_img.className = "upvote"
  upvote_img.addEventListener('click',(event)=> {
    if(window.localStorage.getItem('token')){
      let pid = event.target.parentElement.parentElement.getAttribute('pid');
      if(event.target.src.indexOf('src/upvote2.png')!=-1){
        deleteVote(apiUrl,pid);
        event.target.src = 'src/upvote-512.png';
        event.target.parentElement.childNodes[1].textContent = parseInt(event.target.parentElement.childNodes[1].textContent)-1;
      }else{
        upvote(apiUrl,pid);
        event.target.src = 'src/upvote2.png';
        event.target.parentElement.childNodes[1].textContent = 1+parseInt(event.target.parentElement.childNodes[1].textContent);
      }
    }
    
  });
  const upvote_text = document.createElement("p");
  upvote_text.textContent = data['meta']['upvotes'].length;
  upvote_text.className = "upvote_text";
  upvote_text.setAttribute('data-id-upvotes','')
  data_id_upvotes.appendChild(upvote_img);
  data_id_upvotes.appendChild(upvote_text);
  upvote_text.addEventListener('click',(event)=>{
    if(event.target.parentElement.parentElement.childNodes[1].childNodes[1].style.display == "block"){
      event.target.parentElement.parentElement.childNodes[1].childNodes[1].style.display = "none"
    }else{
      event.target.parentElement.parentElement.childNodes[1].childNodes[1].style.display = "block"      
    }
  })

  const content = document.createElement("div");
  content.className = 'content';
  const data_id_title = document.createElement("h4");
  const edit_button = document.createElement("img");
  edit_button.className = 'edit';
  edit_button.src = 'src/edit.png';
  edit_button.style.display = 'none';

  const edit_text = document.createElement("p");
  edit_text.textContent = 'Edit';
  edit_text.className = 'edit_text';
  edit_text.style.display = 'none'
  data_id_title.className = 'post-title alt-text';
  data_id_title.setAttribute("data-id-title",'');
  if(data['title']){
    data_id_title.textContent = data['title'];
  }else{
    data_id_title.textContent = 'null';
  }
  const content_text = document.createElement("p");
  content_text.textContent = data['text'];
  content_text.className = "content_text";
  const content_img = document.createElement("img");
  content_img.src = 'data:image;base64,'+data['image'];
  content_img.style.width = '100%';
  content_img.style.height = 'auto';
  content_img.style.textAlign = 'center';
  const data_id_author = document.createElement("p");
  data_id_author.className = 'post-author';
  data_id_author.textContent = "Posted by @"+data['meta']['author'];
  data_id_author.setAttribute('data-id-author','');
  data_id_author.style.cursor = 'pointer';

  
  var timestamp = document.createElement("p");
  var d = new Date(data['meta']['published']*1000);
  timestamp.textContent = "Post on: "+d.toDateString();


  var subseddit = document.createElement("p");
  
  if(data['meta']['subseddit']){
    subseddit.textContent = "subseddit: "+data['meta']['subseddit'];
  }else{
    subseddit.textContent = "subseddit: null";
  }
  subseddit.className = "comment_author";
  
  data_id_author.addEventListener('click',(event)=>{
    if(window.localStorage.getItem('token')){
      document.getElementById('userpage_background').style.display = 'flex';
    //console.log(event.target.textContent.split('@')[1]);
      document.getElementById('user_profile_edit').style.display = 'none';

      userPofile2(apiUrl,event.target.textContent.split('@')[1]).then((response)=>{
         //console.log(response);
          loadProfile(response,apiUrl);
      });
    }
    
  })
  const comment_show = document.createElement("img");
  comment_show.className = "comment_show";
  comment_show.src = 'src/comment.png'

  const comment_div = document.createElement("div");
  comment_div.className = "comment_div";
  let comments = data['comments'];
  for(let i = 0;i<comments.length;i++){
    var comment_inner_div = document.createElement("div");
    comment_inner_div.className= "comment_inner_div";
    var comment_author = document.createElement("p");
    comment_author.textContent = "@"+comments[i]['author'];
    comment_author.className = "comment_author";
    
    
    var comment_text = document.createElement("p");
    
    comment_text.className = "comment_text";
    comment_text.textContent = comments[i]['comment'];
    comment_inner_div.appendChild(comment_author);

    comment_inner_div.appendChild(comment_text);
    comment_div.appendChild(comment_inner_div);
  }


  var comment_show_div = document.createElement("div");
  comment_show_div.className = "comment_button_div";
  comment_show_div.appendChild(comment_show);
  var comment_show_counter = document.createElement("p");
  comment_show_counter.className = "comment_show_counter";
  comment_show_counter.textContent = comments.length + " Comments";
  comment_show_div.appendChild(comment_show_counter);
  comment_show_div.appendChild(edit_button);
  comment_show_div.appendChild(edit_text);
  
  content.appendChild(data_id_title);
  content.appendChild(upvote_div);

  content.appendChild(content_text);
  if(data['image']){
    content.appendChild(content_img);
  }
  content.appendChild(data_id_author);
  content.appendChild(subseddit);
  content.appendChild(timestamp);


  content.appendChild(comment_show_div);

  
  let comment_input_div = document.createElement('div');
  let comment_input = document.createElement('input');
  let cpmment_submit = document.createElement('button');
  comment_input.className = "comment_input";
  cpmment_submit.className = 'button button-secondary';
  cpmment_submit.textContent = "Submit";
  comment_input.placeholder = "comments";
  comment_input_div.appendChild(comment_input);
  comment_input_div.appendChild(cpmment_submit);
  comment_div.appendChild(comment_input_div);
  if(!window.localStorage.getItem('token')){
    comment_input_div.style.display = 'none';
  }
  cpmment_submit.addEventListener('click',(event)=>{
    let text = event.target.parentElement.childNodes[0].value;
    if(text){
      let pid = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('pid');
      let last = event.target.parentElement;
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + window.localStorage.getItem('token')
      };  
  
      let payload = {
        'comment':text,
      }
      let request = fetchData(apiUrl+"/post/comment?id="+pid,{headers:headers,method:'Put',body:JSON.stringify(payload)})
        .then((reponse)=>{
          var comment_inner_div = document.createElement("div");
          comment_inner_div.className= "comment_inner_div";
          var comment_author = document.createElement("p");
          comment_author.textContent = "@"+window.localStorage.getItem('username');
          comment_author.className = "comment_author";
          var comment_text = document.createElement("p");
          comment_text.className = "comment_text";
          comment_text.textContent = text;
          comment_inner_div.appendChild(comment_author);
          comment_inner_div.appendChild(comment_text);
          comment_div.insertBefore(comment_inner_div,last);
          window.alert("Operation successful!");
        })
    }
  })




  content.appendChild(comment_div);
  comment_div.style.display = 'none';
  data_id_post.appendChild(data_id_upvotes);
  data_id_post.appendChild(content);
  data_id_post.setAttribute('pid',data['id']);
  comment_show_counter.addEventListener('click',(evrnt)=>{
    if(comment_div.style.display == 'none'){
      comment_div.style.display = 'block';
    }else{
      comment_div.style.display = 'none';
    }
  })
  let username = window.localStorage.getItem('username');
  if(username){
    if(username == data['meta']['author']){
      edit_button.style.display = 'inline-block';
      edit_text.style.display = 'inline-block';
    }
  }
  return data_id_post;
}
function initHTML(){



  const banner = document.createElement('header');
  banner.id = 'nav';
  banner.className = "banner";
  const logo = document.createElement('h1');
  logo.id = 'logo';
  logo.className = 'flex-center';
  logo.textContent = 'Seddit';
  banner.appendChild(logo);
  const nav1 = document.createElement('ul');
  nav1.className = 'nav';
  banner.appendChild(nav1);
  const nav_item1 = document.createElement('l1');
  nav_item1.className = 'nav-item';
  const search1 = document.createElement('input');
  search1.id = 'search';
  search1.setAttribute('data-id-search','');
  search1.placeholder = 'Search Seddit';
  search1.type = 'search';
  nav_item1.appendChild(search1);
  nav1.appendChild(nav_item1);
  const nav_item2 = document.createElement('l1');
  nav_item2.className = 'nav-item';
  const login1 = document.createElement('button');
  login1.className = 'button button-primary';
  login1.setAttribute('data-id-login','');
  login1.textContent = 'Log In';
  nav_item2.appendChild(login1);
  nav1.appendChild(nav_item2);

  const nav_item3 = document.createElement('l1');
  nav_item3.className = 'nav-item';
  const signup1 = document.createElement('button');
  signup1.className = 'button button-secondary';
  signup1.setAttribute('data-id-signup','');
  signup1.textContent = 'Sign Up';
  nav_item3.appendChild(signup1);
  nav1.appendChild(nav_item3);

  const root1 = document.getElementById('root');
  root1.appendChild(banner);
  const main1 = document.createElement('main');
  main1.setAttribute('role','main');
  root1.appendChild(main1);
  const feed1 = document.createElement('ul');
  feed1.id = 'feed';
  feed1.setAttribute('data-id-feed','');
  main1.appendChild(feed1);
  const feed_header = document.createElement('div');
  feed_header.className = 'feed-header';
  const feed_title = document.createElement('h3');
  feed_title.className = 'feed-title alt-text';
  feed_title.textContent = 'Popular posts';
  const feed_button = document.createElement('button');
  feed_button.className = 'button button-secondary';
  feed_button.textContent = 'POST';
  feed_header.appendChild(feed_title);
  feed_header.appendChild(feed_button);
  feed1.appendChild(feed_header);
  const footer = document.createElement('footer');
  const t1 = document.createElement('p');
  t1.textContent = "Seddit";
  footer.appendChild(t1);
  root1.appendChild(footer);
  let main = document.getElementsByTagName('main')[0];
  if(main){
    main.className = 'main';
  }
  
};
function setupNavButton(){
  const b = document.getElementsByClassName('button button-secondary')[0];
  if(b){
    b.addEventListener('click',(event)=> {
      signup_background.style.display = "flex";
    });
  }
 
  const a = document.getElementsByClassName('button button-primary')[0];
  if(a){
    a.addEventListener('click',(event)=> {
      login_background.style.display = "flex";
    });
  }
  
}

function setupNav(apiUrl){
  const nav = document.getElementsByClassName("nav")[0];
  const userimg = document.createElement("img");
  const search = document.getElementById("search");
  if(search){
    search.className = 'search';
  }
  const navitem1 = document.createElement("li");
  const navitem2 = document.createElement("li");
  const logout = document.createElement("img");
  logout.src = "src/logout.png";
  logout.className = "logout_icon";
  logout.id = "logout";
  logout.addEventListener('click',()=>{
    localStorage.clear();
    location.reload();
  })
  
  userimg.src = "src/QQ20190726-0.png";
  userimg.className = "user_icon";
  userimg.id = "user_icon";
  userimg.addEventListener('click',(event)=>{
    document.getElementById('userpage_background').style.display = 'flex';
    document.getElementById('user_profile_edit').style.display = 'flex';
    userPofile(apiUrl).then((response)=>{
      loadProfile(response,apiUrl);
    });
  })




  
  navitem2.appendChild(logout);
  navitem1.appendChild(userimg);
  navitem1.className = "nav-item";
  navitem2.className = "nav-item";
  if(nav){
    nav.appendChild(navitem1);
    nav.appendChild(navitem2);
  }
}

function setupPost(apiUrl){
  //setting post
  const post_background = document.createElement("div");
  const post_box = document.createElement("div");
  post_box.className = 'post_modal_box';
  post_background.className = "modal_background"

  const close3 = document.createElement("div");
  close3.className = "modal_close";
  close3.textContent = "+";
  close3.addEventListener('click',(event)=> {
    post_background.style.display = "none";
  });
  var post_text = document.createElement("textarea");
  post_text.className = "post_text";
  post_text.id = "post_text";
  var post_title = document.createElement("input");
  post_title.className = "post_title";
  post_title.setAttribute('type',"text");
  post_title.setAttribute('name',"title");
  post_title.placeholder = "Title"
  post_title.id = "post_title";


  const post = document.getElementsByClassName('button button-secondary')[1];
  if(post){
    post.addEventListener('click',(event)=> {
      if(window.localStorage.getItem('token')){
        post_background.style.display = "flex";
      }
    });
  }
  var post_button = document.createElement("input"); //input element, Submit button
  post_button.className = "post_button";
  post_button.setAttribute('type',"button");
  post_button.setAttribute('value',"POST");


  var post_file = document.createElement("input"); 
  post_file.type = 'file';
  post_file.className = 'post_file';
  post_file.accept = "image/*";
  post_file.id = "post_file";
  post_background.appendChild(post_box);
  post_box.appendChild(close3);
  post_box.appendChild(post_title);
  post_box.appendChild(post_text);
  post_box.appendChild(post_file);

  post_box.appendChild(post_button);
  document.body.insertBefore(post_background, document.body.firstChild);
  post_button.addEventListener('click',(event)=>{
    if(window.localStorage.getItem('token')){
      let text = document.getElementById('post_text').value;
      let title = document.getElementById('post_title').value;
      let file = document.getElementById('post_file').files[0];
      if(file){
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + window.localStorage.getItem('token')
          };
          let payload = {
            'title':text,
            'text':title,
            'subseddit': 'default',
            'image':reader.result.split(',')[1]
          }
          let body = JSON.stringify(payload);
          let result = fetchData(apiUrl+'/post/',{method: 'POST',headers:headers,body:body});
          result.then(()=>{
            loadUserFeed(apiUrl);
            window.alert("OK")
          })
        };
    }else{
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + window.localStorage.getItem('token')
      };
      let payload = {
        'title':title,
        'text':text,
        'subseddit': 'default',
        'image':null
      }
      console.log(payload);
      let body = JSON.stringify(payload);
          let result = fetchData(apiUrl+'/post/',{method: 'POST',headers:headers,body:body});
          result.then(()=>{
            loadUserFeed(apiUrl);
            window.alert("OK")
          })
    }
    }   
  })
} 

function updateProfile(event,apiUrl){
  let name = event.target.parentElement.childNodes[0].value;
  let email = event.target.parentElement.childNodes[1].value;
  let password = event.target.parentElement.childNodes[2].value;
  if(!(name||email||password)){
    window.alert("Can not be empty");
  }else{
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + window.localStorage.getItem('token')
    };  

    let payload = {
      'name':name,
      'email':email,
      'password':password
    }
    let request = fetchData(apiUrl+"/user/",{headers:headers,method:'Put',body:JSON.stringify(payload)})
      .then((reponse)=>{
        window.alert("Operation successful!");
        userPofile(apiUrl).then((response)=>{
          loadProfile(response,apiUrl);
        });
      })
  }
}




function initUserPage(apiUrl){
  const userpage_background = document.createElement("div");
  userpage_background.className = "modal_background";
  userpage_background.id = "userpage_background";

  let close = document.createElement("div");
  close.className = "modal_close";
  close.textContent = "+";
  close.addEventListener('click',(event)=> {
    userpage_background.style.display = "none";
    document.getElementById('following_box').style.display = 'none';
  });
  const edit_button = document.createElement("img");
  edit_button.className = 'modal_edit';
  edit_button.src = 'src/edit.png';
  edit_button.id = 'user_profile_edit';
  edit_button.style.display = 'none';
  edit_button.addEventListener('click',(event)=>{
    document.getElementById('update_profile').style.display = 'flex';
    let inputs = document.getElementById('update_profile_innerdiv');
    inputs.childNodes[0].value = document.getElementById('userpage_name').textContent;
    inputs.childNodes[1].value = document.getElementById('userpage_email').textContent;
    inputs.childNodes[2].placeholder = 'New Password';

  })
  
  const userpage_box = document.createElement("div");
  userpage_box.className = 'userpage_box';
  const userpage_box2 = document.createElement("div");
  userpage_box2.className = 'userpage_box';
  const icon = document.createElement("img");
  icon.src = "src/QQ20190726-0.png";
  icon.className = "userpage_icon";
  const cotent = document.createElement("div");
  

  cotent.className = "userpage_model";
  cotent.appendChild(icon);
  
  const user_info = document.createElement("div");
  user_info.className = "userinfo";
  
  const email = document.createElement("p");
  email.className = "userinfo_text";
  email.id = "userpage_email";

  const name = document.createElement("p");
  name.className = "userinfo_text";
  name.id = "userpage_name"
  const uname = document.createElement("p");
  uname.className = "userinfo_text_username";
  uname.id = "userpage_username"
  const total_vote = document.createElement("p");
  total_vote.className = "userinfo_text_username";
  total_vote.id = "total vote";
  total_vote.textContent= "Vote:0";
  
  user_info.appendChild(uname);
  user_info.appendChild(email);
  user_info.appendChild(name);
  user_info.appendChild(total_vote);



  const postinfo = document.createElement("div");
  postinfo.className = 'postinfo';
  const following = document.createElement("p");
  following.className = "postinfo_text";
  following.textContent = "Following:100";
  following.id = "Following";

  const following_box = document.createElement("div");
  following_box.className = 'following_box';
  following_box.style.display = "none";
  following_box.id = 'following_box';
  var following_inner_box = document.createElement("div");
  following_inner_box.className = 'following_inner_box';
  following_inner_box.id = "following_inner_box";
  following_box.appendChild(following_inner_box);
  let close2 = document.createElement("div");
  close2.className = "modal_close";
  close2.textContent = "+";
  close2.addEventListener('click',(event)=> {
    following_box.style.display = "none";
  });
  following_box.appendChild(close2);

  const update_profile = document.createElement("div");
  update_profile.className = 'update_profile';
  update_profile.style.display = "none";
  update_profile.id = 'update_profile';
  let close4 = document.createElement("div");
  close4.className = "modal_close";
  close4.textContent = "+";
  close4.addEventListener('click',(event)=> {
    update_profile.style.display = "none";
  });
  
  let update_profile_innerdiv = document.createElement("div");
  update_profile_innerdiv.style.textAlign = "center";
  let email_pofile = document.createElement("input");
  email_pofile.className = "signup_input";
  let password = document.createElement("input");
  password.className = "signup_input";

  let name_pofile = document.createElement("input");
  name_pofile.className = "signup_input";

  let  update_profile_button= document.createElement("button");
  update_profile_button.className = "button button-secondary";
  update_profile_button.textContent = "Submit";
  update_profile_innerdiv.className = "update_profile_innerdiv";
  update_profile_innerdiv.id = 'update_profile_innerdiv';
  update_profile_button.addEventListener('click',(event)=>{
     updateProfile(event,apiUrl);
     
  })

  update_profile.appendChild(close4);
  update_profile_innerdiv.appendChild(email_pofile);
  update_profile_innerdiv.appendChild(password);
  update_profile_innerdiv.appendChild(name_pofile);
  update_profile_innerdiv.appendChild(update_profile_button);

  update_profile.appendChild(update_profile_innerdiv);

  
  following.addEventListener('click',(event)=>{
    let username = document.getElementById('userpage_username').textContent;
    if(username == window.localStorage.getItem('username')){
      following_box.style.display = "flex";
    }
  })




  const post_box = document.createElement("div");
  post_box.className = 'post_modal_box_userpage';
  post_box.id = 'post_modal_box_userpage';
  const close3 = document.createElement("div");
  close3.className = "modal_close";
  close3.textContent = "+";
  post_box.style.display = "none";
  close3.addEventListener('click',(event)=> {
    post_box.style.display = "none";
  });
  var post_text = document.createElement("textarea");
  post_text.className = "post_text";
  post_text.id = "post_text2";
  var post_title = document.createElement("input");
  post_title.className = "post_title";
  post_title.setAttribute('type',"text");
  post_title.setAttribute('name',"title");
  post_title.placeholder = "Title"
  post_title.id = "post_title2";

  var post_button = document.createElement("input"); //input element, Submit button
  post_button.className = "button button-secondary";
  post_button.setAttribute('type',"button");
  post_button.setAttribute('value',"POST");
  post_button.style.left = "30%";
  post_button.style.position = "relative";
  post_button.addEventListener('click',(event)=>{
    let new_title = event.target.parentElement.childNodes[1].value;
    let new_text = event.target.parentElement.childNodes[2].value;
    let new_file = event.target.parentElement.childNodes[3].files[0];
    let pid = event.target.parentElement.getAttribute('pid');
    if(window.localStorage.getItem('token')){
      if(new_file){
        const reader = new FileReader();
        reader.readAsDataURL(new_file);
        reader.onload = () => {
          let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + window.localStorage.getItem('token')
          };
          let payload = {
            'title':new_title,
            'text':new_text,
            'subseddit': '',
            'image':reader.result.split(',')[1]
          }
          let body = JSON.stringify(payload);
          let result = fetchData(apiUrl+'/post/?id='+pid,{method: 'PUT',headers:headers,body:body});
          result.then(()=>{
            userPofile(apiUrl).then((response)=>{
              loadProfile(response,apiUrl);
            });
            window.alert("ok");
            
          })
        };
    }else{
      let src = window.localStorage.getItem('img');
      let new_src = null;
      if(src){
        new_src = src.split(',')[1];
      }
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + window.localStorage.getItem('token')
      };
      let payload = {
        'title':new_title,
        'text':new_text,
        'subseddit': '',
        'image':new_src
      }

      let body = JSON.stringify(payload);
      let result = fetchData(apiUrl+'/post/?id='+pid,{method: 'PUT',headers:headers,body:body});
          result.then(()=>{
            //console.log('nopic ok');
            //loadUserFeed(apiUrl);
            userPofile(apiUrl).then((response)=>{
              loadProfile(response,apiUrl);
            });
            window.alert("nopic ok");

          })
    }
    }
  })

  var delete_button = document.createElement("input"); //input element, Submit button
  delete_button.className = "button button-secondary";
  delete_button.setAttribute('type',"button");
  delete_button.setAttribute('value',"delete");
  delete_button.style.left = "25%";
  delete_button.style.position = "relative";
  delete_button.style.backgroundColor = 'red';
  delete_button.addEventListener('click',(event)=>{
    let pid = event.target.parentElement.getAttribute('pid');
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + window.localStorage.getItem('token')
    };
    let result = fetchData(apiUrl+'/post/?id='+pid,{method: 'DELETE',headers:headers});
          result.then(()=>{
            window.alert("ok");
          })
  })

  var post_file = document.createElement("input"); 
  post_file.type = 'file';
  post_file.className = 'post_file';
  post_file.accept = "image/*";
  post_file.id = "post_file2";
  post_box.appendChild(close3);
  post_box.appendChild(post_title);
  post_box.appendChild(post_text);
  post_box.appendChild(post_file);
  post_box.appendChild(delete_button);
  post_box.appendChild(post_button);



  const followed = document.createElement("p");
  followed.className = "postinfo_text";
  followed.textContent = "Followed:100";
  followed.id= "Followed";
  const post_counter = document.createElement("p");
  post_counter.className = "postinfo_text";
  post_counter.textContent = "Post:100";
  post_counter.id = "post_counter";
  const posts = document.createElement("div");
  posts.className = 'posts_userpage';
  posts.id = 'userpage_posts';

  let follow_div = document.createElement("div");
  follow_div.id = "follow_div";
  let follow_input = document.createElement("input");
  follow_input.className = "follow_input";
  follow_input.placeholder = "Username";
  let button = document.createElement("button");
  button.textContent = "Follow";
  button.className = "button button-secondary";
  follow_div.appendChild(follow_input);
  follow_div.appendChild(button);
  follow_div.style.display = "none";
  button.addEventListener('click',(event)=>{
    let username = event.target.parentElement.childNodes[0].value;
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + window.localStorage.getItem('token')
    };
    let result = fetchData(apiUrl+'/user/follow?username='+username,{method: 'PUT',headers:headers});
          result.then(()=>{
            userPofile(apiUrl).then((response)=>{
              loadProfile(response,apiUrl);
            });
            window.alert("ok");
        })
  })
  
  
  
  let follow = document.createElement("div");
  follow.className = "modal_follow";
  follow.textContent = "+";
  follow.addEventListener('click',(event)=> {
    if(event.target.style.transform != 'rotate(45deg)'){
      follow_div.style.display = "block";
      document.getElementById("userpage_posts").style.height = "74%";
      event.target.style.transform = 'rotate(45deg)';
    }else{
      follow_div.style.display = "none";
      document.getElementById("userpage_posts").style.height = "80%";
      event.target.style.transform = 'rotate(0deg)';

    }
    
  });



  postinfo.appendChild(following);
  postinfo.appendChild(followed);
  postinfo.appendChild(post_counter);




  cotent.appendChild(user_info);
  cotent.appendChild(postinfo);
  cotent.appendChild(follow_div);

  cotent.appendChild(posts);


  userpage_box.appendChild(close);
  userpage_box.appendChild(follow);

  userpage_box.appendChild(edit_button);

  userpage_box.appendChild(cotent);
  userpage_box2.style.zIndex = '9999';
  userpage_background.appendChild(userpage_box);
  userpage_background.appendChild(following_box);
  userpage_background.appendChild(update_profile);
  userpage_background.appendChild(post_box);
  //userpage_background.append(userpage_box2);

  userpage_background.onmouseover = ()=>{
    document.body.style.overflow='hidden';
  }
  userpage_background.onmouseout = ()=>{
    document.body.style.overflow='auto';
  }
  document.body.insertBefore(userpage_background, document.body.firstChild);
}
function initLogin(apiUrl){
  // setting login
  const login_background = document.createElement("div");
  const login_box = document.createElement("div");
  const content_img = document.createElement("img");
  const content_form = document.createElement("form");
  login_background.className = "modal_background";
  login_background.id = 'login_background';
  login_box.className = 'modal_box';
  content_img.src = "src/QQ20190726-0.png";
  content_img.style.borderRadius = "50%";
  content_img.margin = "0px auto";
  
  var login_input1 = document.createElement("input"); //input element, text
  login_input1.setAttribute('type',"text");
  login_input1.setAttribute('name',"username");
  login_input1.id = 'login_username';
  login_input1.placeholder = "Username";
  login_input1.className = "login_input";


  var login_input2 = document.createElement("input"); //input element, text
  login_input2.setAttribute('type',"password");
  login_input2.setAttribute('password',"password");
  login_input2.id = 'login_password';

  login_input2.className = "login_input";
  login_input2.placeholder = "Password";

  var signin_button = document.createElement("input"); //input element, Submit button
  signin_button.className = "signin_button";
  signin_button.setAttribute('type',"button");
  signin_button.setAttribute('value',"Log in");
  

  const close = document.createElement("div");
  close.className = "modal_close";
  close.textContent = "+";
  close.addEventListener('click',(event)=> {
    login_background.style.display = "none";
  });
    
  signin_button.addEventListener('click',(event)=> {
    //console.log("ccc");
    if(document.getElementById('login_username').value && document.getElementById('login_password').value){
      let payload = {
        username:document.getElementById('login_username').value,
        password:document.getElementById('login_password').value
      }
      login(apiUrl,payload);
    }else{
      window.alert("username and password can not be empty");
    }
    
  });
  

  login_box.appendChild(close);
  content_form.appendChild(login_input1);
  content_form.appendChild(login_input2);
  content_form.appendChild(signin_button);
  content_form.style.fontSize = "42px";

  login_box.append(content_img);
  login_box.append(content_form);
  login_background.append(login_box);

  document.body.insertBefore(login_background, document.body.firstChild);
}

function initSignup(apiUrl){
  const signup_background = document.createElement("div");
  const signup_box = document.createElement("div");
  const signup_form = document.createElement("form");
  signup_box.className = 'modal_box';
  signup_background.className = "modal_background";
  signup_background.id = "signup_background";

  let username = document.createElement("input"); //input element, text
  username.className = "signup_input";
  username.id = 'username';
  username.setAttribute('type',"text");
  username.setAttribute('name',"username");
  username.placeholder = "Username";

  let pas = document.createElement("input"); //input element, text
  pas.className = "signup_input";
  pas.id = 'password';
  pas.setAttribute('type',"password");
  pas.setAttribute('password',"password");
  pas.placeholder = "Password";

  let email = document.createElement("input"); //input element, text
  email.className = "signup_input";
  email.id = 'email';
  email.setAttribute('type',"text");
  email.setAttribute('name',"email");
  email.placeholder = "E-mail";
  
  let name = document.createElement("input"); //input element, text
  name.className = "signup_input";
  name.id = 'name';
  name.setAttribute('type',"text");
  name.setAttribute('name',"name");
  name.placeholder = "name";
 
  let signup_button = document.createElement("input"); //input element, Submit button
  signup_button.className = "signup_button";
  signup_button.setAttribute('type',"button");
  signup_button.setAttribute('value',"Sign Up");
  signup_button.addEventListener('click',(event)=> {
    if(document.getElementById('username').value&&
    document.getElementById('password').value&&
    document.getElementById('email').value&&
    document.getElementById('name').value
    ){
      let payload = {
        "username" : document.getElementById('username').value,
        "password" : document.getElementById('password').value,
        "email": document.getElementById('email').value,
        "name": document.getElementById('name').value
      }
      signup(apiUrl,payload);
    }else{
      window.alert("username, password, email and name can not be empty");
    }
    

  });
  
  const close2 = document.createElement("div");
  close2.className = "modal_close";
  close2.textContent = "+";
  close2.addEventListener('click',(event)=> {
    signup_background.style.display = "none";
  });
  
  signup_box.appendChild(close2);
  signup_form.appendChild(username);
  signup_form.appendChild(pas);
  signup_form.appendChild(email);
  signup_form.appendChild(name);
  signup_form.appendChild(signup_button);
  signup_box.append(signup_form)
  signup_background.appendChild(signup_box);
  document.body.insertBefore(signup_background, document.body.firstChild);
}


const fetchData = (path, options) => 
    fetch(path, options)
      .then(function(response) {
        if (!response.ok) {
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .catch(err => {
        console.warn(`API_ERROR: ${err.message}`);
        window.alert(err.message);
      })


export default initApp;