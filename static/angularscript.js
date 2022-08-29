var app = angular.module("indexApp", []);
app.controller("registerController", function($scope,$rootScope, $log) {
    $rootScope.registerShow=true;
    $rootScope.loginShow=false;
    $scope.login=function(){
        $rootScope.registerShow=false;
        $rootScope.loginShow=true;
    }

    $scope.regSubmit=async function(){
    // const form = document.getElementById("reg-form");

    // form.addEventListener('submit', registerUser);

    // async function registerUser(event) {
    //   event.preventDefault()
    //   const name = document.getElementById("name").value;
    //   const username = document.getElementById("username").value;
    //   const password = document.getElementById("password").value;
    //   const role = document.getElementById("role").value;
    //   const age = document.getElementById("age").value;

    $log.log("Name : "+ $scope.user.name);
      const name=$scope.name;
      const username = $scope.username;
      const password = $scope.password;
      const role = $scope.role;
      const age = $scope.age;

      const result = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name, username, password, role, age
        })
      }).then(res => res.json());

      if (result.status === 'OK') {
        alert('Success');
      } else {
        alert(result.error);
      }
      console.log(result);
    }
    

});

app.controller("loginController", function($scope,$rootScope) {
    

})