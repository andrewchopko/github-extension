var gitHubEndpoints = {
	mostPopularRepos: "https://api.github.com/search/repositories?q=",
	reposByUser: "https://api.github.com/users/",
	repoByUser: "https://api.github.com/repos/"
}

var data = {
	mostPopularByStars: "",
	mostPopularByIssues: "",
  mostPopularByForks: ""
}


function clickTab(e) {
  //chrome.tabs.executeScript(null,{code: "console.log(" + e.target.id + ")"});
  var allDivs = document.querySelectorAll('div.tab');
  var buttons = document.querySelectorAll('.tab-button');
	for (var i = 0; i < allDivs.length; i++) {
    allDivs[i].classList.add('hidden');
    buttons[i].classList.remove('active');
  }
	document.getElementById(`tabcontent${e.target.id}`).classList.remove ('hidden');
	document.getElementById(`${e.target.id}`).classList.add('active');
}

function getMostPopularRepos(){
	var language = document.getElementById('search-params').value;
	if(!language){
		language = 'javascript';
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", gitHubEndpoints.mostPopularRepos + language + "&sort=stars&order=desc", true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			var response = JSON.parse(xhr.response);
			
      var issues = response.items.sort(compareByIssues).map(makeReposList).join(" ");
      var forks = response.items.sort(compareByForks).map(makeReposList).join(" ");
      var stars = response.items.sort(compareByStars).map(makeReposList).join(" ");

      data.mostPopularByStars = stars;
      data.mostPopularByIssues = issues;
      data.mostPopularByForks = forks;
      showRepos(stars);
    }
	}
	xhr.send();
}

function getSomeUserReposList(username){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", gitHubEndpoints.reposByUser + username + "/repos", true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			var response = JSON.parse(xhr.response);
      var items = response.sort(compareByStars).map(makeReposList).join(" ");
      showSingleUserRepos(items);
    }
	}
	xhr.send();
}

function getSomeUserSpecificRepo(user, repo){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", gitHubEndpoints.repoByUser + user + "/" + repo, true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			var response = JSON.parse(xhr.response);
      var item = makeSingleRepo(response);
      showSingleUserRepo(item);
    }
	}
	xhr.send();
}

function makeReposList(item){
      	var tpl = `
					<li>
			      <div class="repository">
			        <div class="logo-author">
			          <img src="${item.owner.avatar_url}">
			        </div>
			        <div class="about">
			          <h4>${item.full_name}</h4>
			          <h5>${item.owner.login}</h5>
			          <span>${item.language} | <i class="fas fa-star"></i> ${item.stargazers_count} | <i class="fas fa-code-branch"></i> ${item.forks}</span>
			        </div>
			      </div>
			    </li>
				`;
				return tpl;
}

function makeSingleRepo(item){
	return tpl = `
					<div class="repository">
            <div class="logo-author">
              <img src="${item.owner.avatar_url}">
            </div>
            <div class="about">
              <h4>${item.full_name}</h4>
              <span>${item.language} | <i class="fas fa-star"></i> ${item.stargazers_count} | <i class="fas fa-code-branch"></i> ${item.forks}</span>
              <h5>${item.description}</h5>
              <span>id: ${item.id} | Open Issues: ${item.open_issues} </span>
            </div>
          </div>`
}

function compareByIssues(a, b){
	if(a.open_issues < b.open_issues)
		return 1;
	if (a.open_issues > b.open_issues)
		return -1;
}

function compareByForks(a, b){
	if(a.forks < b.forks)
		return 1;
	if (a.forks > b.forks)
		return -1;
}

function compareByStars(a, b){
	if(a.stargazers_count < b.stargazers_count)
		return 1;
	if (a.stargazers_count > b.stargazers_count)
		return -1;
}

function chooseMethod(){
	var m = document.getElementById('search-by-author').value;
	if(m){
		if(m.indexOf("/") != -1){
			m = m.split("/");
			getSomeUserSpecificRepo(m[0],m[1]);
		}else{
			getSomeUserReposList(m);
		}
	}
}

function sortByStars(){
	var target = document.getElementById('stars');
	if(!target.classList.contains('active')){
		showRepos(data.mostPopularByStars);
		var sortButtons = document.getElementsByClassName('sort-param');
		for (var i = 0; i < sortButtons.length; i++) {
			sortButtons[i].classList.remove('active');
		}
		target.classList.add('active');
	}
}

function sortByIssues(){
	var target = document.getElementById('issues');
	if(!target.classList.contains('active')){
		showRepos(data.mostPopularByIssues);
		var sortButtons = document.getElementsByClassName('sort-param');
		for (var i = 0; i < sortButtons.length; i++) {
			sortButtons[i].classList.remove('active');
		}
		target.classList.add('active');
	}
}

function sortByForks(){
	var target = document.getElementById('forks');
	if(!target.classList.contains('active')){
		showRepos(data.mostPopularByForks);
		var sortButtons = document.getElementsByClassName('sort-param');
		for (var i = 0; i < sortButtons.length; i++) {
			sortButtons[i].classList.remove('active');
		}
		target.classList.add('active');
	}
}

function showRepos(repos){
	document.getElementsByClassName('popular-repos-button')[0].classList.add('hidden');
	var parent = document.getElementById('repos-list');
	for(var i=0; i < parent.children.length; i++){
		parent.removeChild(parent.children[i]);
	}
	parent.innerHTML = repos;
	document.getElementById("full-content").classList.remove('hidden');
}

function showSingleUserRepos(repos){
	var parent = document.getElementById('user-repos-list');
	for(var i=0; i < parent.children.length; i++){
		parent.removeChild(parent.children[i]);
	}
	parent.innerHTML = repos;
	document.getElementById('solo-repository-result').classList.add('hidden');
	document.getElementById('hidescrollbar').classList.remove('hidden');
}

function showSingleUserRepo(repo){
	var parent = document.getElementById('solo-repository-result');
	for(var i=0; i < parent.children.length; i++){
		parent.removeChild(parent.children[i]);
	}
	parent.innerHTML = repo;
	document.getElementById('hidescrollbar').classList.add('hidden');
	parent.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('.tab-button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', clickTab);
  }
  document.getElementById('search-button').addEventListener('click', getMostPopularRepos);
  document.getElementById('stars').addEventListener('click', sortByStars);
  document.getElementById('issues').addEventListener('click', sortByIssues);
  document.getElementById('forks').addEventListener('click', sortByForks);
  var popularReposButton = document.querySelector('.popular-repos-button');
  popularReposButton.addEventListener('click', getMostPopularRepos);
  document.getElementById('search-by-author-button').addEventListener('click', chooseMethod);
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    var tab = tabs[0];
   	if(tab.url.indexOf("github.com") != -1){
   		alert("Github");
   	}
  });
});

