// Function for digital clock
function  digitalClock() {
    // Initializing variables
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1; 
    let today = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    // Formatting variables
    today = formatNumber(today);
    month = formatNumber(month);
    hour = formatNumber(hour);
    minute = formatNumber(minute);
    second = formatNumber(second);

    // Setting HTML
    document.querySelector(".date").innerText = today + "-" + month + "-" + year;
    document.querySelector(".clock").innerText = hour + " : " + minute + " : " + second + " ";
    
    // Checking to see if anything should be toasted
    checkForNotifications(second);
    
    // Making DateAndTime function recursive
    setTimeout(digitalClock, 1000);
}
digitalClock()


//-------------------- classes according to diagram provided by the WDT IT department -------------------------//

class Employee {
    constructor(name, surname){
        this.name = name;
        this.surname = surname;
    }
};


//----------------------------- staffmember --------------------------------------//

// Initializing variables
let listOfStaffMembers = [];

class StaffMember extends Employee {
    constructor(name, surname, picture, email, status, outTime, duration, expectedReturnTime){
        super(name, surname);
        this.picture = picture;
        this.email = email;
        this.status = status;
        this.outTime = outTime;
        this.duration = duration;
        this.expectedReturnTime = expectedReturnTime;
    }
    staffMemberIsLate () {
        return this.expectedReturnTime <= new Date() ? true : false;
    }
};

// Click events for staff functionality
$(function() {
    document.getElementById("staffTable").onclick = highlight;
    $("#enterDuration").click(function(){staffOut()});
    $("#inBtn").click(function(){staffIn()});
});

// Retrieve list of 5 members from randomuser API
const staffUserGet = async()=> {
    const url = "https://randomuser.me/api/?results=5&inc=picture,name,email"
    const response = await fetch(url);
    const data = await response.json();

    for (let i=0;i < data.results.length;i++){
        let staffMember = new StaffMember(data.results[i].name.first, data.results[i].name.last, data.results[i].picture.thumbnail, data.results[i].email,"IN")
        listOfStaffMembers.push(staffMember)
    }
}; 

// Adding the users to the table
staffUserGet().then(function(){
    for (let i=0;i < listOfStaffMembers.length;i++){
        let row = document.getElementById("staffTable").insertRow(i);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);
        let cell8 = row.insertCell(7);

        cell1.innerHTML = '<img src='+listOfStaffMembers[i].picture+'>';
        cell2.innerHTML = listOfStaffMembers[i].name;
        cell3.innerHTML = listOfStaffMembers[i].surname;
        cell4.innerHTML = listOfStaffMembers[i].email;
        cell5.innerHTML = listOfStaffMembers[i].status;
    }
});

function staffOut(){
    minutes = parseInt($("#minutes").val());
    if (isNaN(minutes) || minutes == "" || minutes <= 0){
        swal("Oops!", "Please enter minutes in correct format")
        return;
    }

    convertMinutesToHour =  Math.floor(minutes / 60);
    minutesRemainder = minutes % 60 ;
    duration = convertMinutesToHour == 0 ? minutesRemainder + " min" :  convertMinutesToHour + " hr " + minutesRemainder + " min"

    let now = new Date();
    let hour = now.getHours();
    let mins = now.getMinutes();
    let expectedTime = new Date();
    expectedTime = new Date(expectedTime.getTime() + minutes * 60 * 1000)
    let expectedHour = expectedTime.getHours();
    let expectedMinute = expectedTime.getMinutes();
    hour = formatNumber(hour);
    mins = formatNumber(mins);
    expectedHour = formatNumber(expectedHour);
    expectedMinute = formatNumber(expectedMinute);
    let timeStamp = hour + ":" + mins;
    let expectedTimestamp = expectedHour + ":" + expectedMinute

    $(".selectedstaffTable").find("td:eq(4)").empty().append("OUT");
    $(".selectedstaffTable").find("td:eq(5)").empty().append(timeStamp);
    $(".selectedstaffTable").find("td:eq(6)").empty().append(duration);
    $(".selectedstaffTable").find("td:eq(7)").empty().append(expectedTimestamp);
    currentStaff.duration = duration;
    currentStaff.expectedReturnTime = expectedTime;
    currentStaff.outTime = now;
    currentStaff.status = "OUT";

    $("#outBtn").prop("disabled", true);
};


function staffIn(){
    currentStaff.duration = null;
    currentStaff.expectedReturnTime = null;
    currentStaff.outTime = null;
    currentStaff.status = "IN";
    $(".selectedstaffTable").find("td:eq(4)").empty().append("IN");
    $(".selectedstaffTable").find("td:eq(5)").empty();
    $(".selectedstaffTable").find("td:eq(6)").empty();
    $(".selectedstaffTable").find("td:eq(7)").empty();
}; 

function showStaffToast(staffMemberIndex){
    let image = `${listOfStaffMembers[staffMemberIndex].picture}`;
    let title = "Staff Member";
    let description = `${listOfStaffMembers[staffMemberIndex].name} ${listOfStaffMembers[staffMemberIndex].surname} has been out of office for ${listOfStaffMembers[staffMemberIndex].duration}.`;
    let toast = new myToast(image, title, description);
    
    toast.show();
}


//------------------------------------------- Genaral functions ---------------------------------------------------//

//Toast function for staff and delivery driver
function checkForNotifications(second){
    if (second == 0){
        for(let i = 0; i < listOfStaffMembers.length; i++){
            if (listOfStaffMembers[i].staffMemberIsLate() && !listOfStaffMembers[i].toasted){
                showStaffToast(i);
                listOfStaffMembers[i].toasted = 1;
            }
        }
        for(let i = 0; i < listOfDeliveryDrivers.length; i++){
            if (listOfDeliveryDrivers[i].deliveryDriverIsLate() && !listOfDeliveryDrivers[i].toasted){
                showDeliveryToast(i);
                listOfDeliveryDrivers[i].toasted = 1;
            }
        }
    }
}

//Function for creating toast
function myToast(image, title, description) {
    let toastElement = buildToast(image, title, description);
    let toastWrapper = getOrCreateToastWrapper();
    toastWrapper.append(toastElement);
    this.bootstrapToast = bootstrap.Toast.getOrCreateInstance(toastElement);
    
    this.show = function() {
        this.bootstrapToast.show();
    }
    
    this.hide = function() {
        this.bootstrapToast.hide();
    }
    
    this.dispose = function() {
        this.bootstrapToast.dispose();
    }
}

function getOrCreateToastWrapper() {
    let toastWrapper = document.querySelector('body > [data-toast-wrapper]');
    
    if (!toastWrapper) {
        toastWrapper = document.createElement('div');
        toastWrapper.style.zIndex = 11;
        toastWrapper.style.position = 'fixed';
        toastWrapper.style.bottom = 0;
        toastWrapper.style.right = 0;
        toastWrapper.style.padding = '1rem';
        toastWrapper.setAttribute('data-toast-wrapper', '');
        document.body.append(toastWrapper);
    }
    return toastWrapper;
}

function buildToastHeader(image,title) {
    let toastHeader = document.createElement('div');
    toastHeader.setAttribute('class', 'toast-header');
    
    let img;
    if(image == "Motorcycle"|| image == "Car") {
        img = document.createElement('i');
        img.setAttribute('class', `fa-solid fa-${image.toLowerCase()} fa-lg`);
    } else {
        img = document.createElement('img');
        img.setAttribute('class', 'rounded me-2');
        img.setAttribute('src', '');
        img.setAttribute('alt', '');
        img.src = image;
    }

    let strong = document.createElement('strong');
    strong.setAttribute('class', 'ms-4');
    strong.textContent = title;
    
    let closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('class', 'btn-close ms-auto');
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('data-label', 'Close');
    toastHeader.append(img);
    toastHeader.append(strong);
    toastHeader.append(closeButton);

    return toastHeader;
}

function buildToastBody(description) {
    let toastBody = document.createElement('div');
    toastBody.setAttribute('class', 'toast-body');
    toastBody.style.textAlign = "center" ;
    toastBody.textContent = description;
    
    return toastBody;
}

function buildToast(image, title, description) {
    let toast = document.createElement('div');
    toast.setAttribute('class', 'toast');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    let toastHeader = buildToastHeader(image, title);
    let toastBody = buildToastBody(description);
    
    toast.append(toastHeader);
    toast.append(toastBody);
    
    return toast;
}


// Function for making sure numbers below 10 has two digits
function formatNumber(number) {
    number = number < 10 ?  '0' + number : number;

    return number
}


function highlight(event) {
    // Get id of the table that clicked row belongs to
    tableId = event.target.parentNode.parentNode.id;

    // Get previously selected element from table and unselect it
    selected = document.getElementsByClassName("selected" + tableId);
  
    if (selected[0]){
        selected[0].className = "";
    }
    
    // Select clicked element
    event.target.parentNode.className = "selected" + tableId;

    // Change current staff or delivery depending on table clicked
    // Then enable corresponding action-button
    switch(tableId){
        case "staffTable":
            currentStaff = listOfStaffMembers[event.target.parentNode.rowIndex-1];
            $("#outBtn").prop("disabled", false);
            break;
        case "deliveryTable":
            currentDriver = listOfDeliveryDrivers[event.target.parentNode.rowIndex-1];
            $("#clearBtn").prop("disabled", false);
            break;
    }
};



//----------------------------- Delivery driver --------------------------------------//

// Initializing variables
let listOfDeliveryDrivers = [];

class DeliveryDriver extends Employee {
    constructor(vehicle, name, surname, telephone, deliveryAddress, returnTime){
    super(name, surname);
        this.vehicle = vehicle;
        this.telephone = telephone;
        this.deliveryAddress = deliveryAddress;
        this.returnTime = returnTime;
    }
    deliveryDriverIsLate(){
        return this.returnTime <= new Date() ? true : false;
    }
};

$(function() {
    document.getElementById("deliveryTable").onclick = highlight;
    $("#addBtn").click(function(){
        let vehicleName = $("#deliveryVehicleName").val();
        let name = $("#deliveryName").val();
        let surName = $("#deliverySurName").val();
        let phone = $("#deliveryPhone").val();
        let address = $("#deliveryAddress").val();
        let returnTime = $("#deliveryReturnTime").val();

        let validInput = validateDelivery(vehicleName, name, surName, phone, address, returnTime)
        if (validInput){
            addDelivery(vehicleName,name,surName,phone,address,returnTime);
        }
    });
    $("#clearBtn").click(function(){
        swal({
            title: "Are you sure you want to clear this?",
            icon: "warning",
            buttons: {
                cancel : 'Cancel',
                confirm : {text:'Confirm',className:'sweet-warning'} 
            },
        })
        .then((willDelete) => {
            if (willDelete) {
                removeDeliveryDriver(currentDriver)
                $(".selecteddeliveryTable").remove();
                $("#clearBtn").prop("disabled", true);
            }
        });
    })
});

function validateDelivery(vehicleName, name, surName, phone, address, returnTime){
    if (!vehicleName){
        swal("Oops!", "please select one delivery vehicle")
        return false;
    }

    if(!isNaN(name) || name == ""){
        swal("Oops!", "Something is incorrect in the name field")
        return false;
    }

    if(!isNaN(surName) || surName  == ""){
        swal("Oops!", "Something is incorrect in the surname field")
        return false;
    }

    const phonePattern ="[0-9]{8}";
    if (!phone.match(phonePattern)){
        swal("Oops!", "Phone number is not in the correct format")
        return false;
    }

    if(address == "" || address == null || address.length > 100){
        swal("Oops!", "Please check the address field")
        return false;
    }

    const returnTimePattern ="[0-9]{2}[:][0-9]{2}";
    if (returnTime == "" || returnTime >= 0 || (!returnTime.match(returnTimePattern)) ){
        swal("Oops!", "Please enter delivery time in the correct time format")
        return false;
    } 
    let returnTimeSliced = returnTime.split(':');

    if (returnTimeSliced[0] < 0 || returnTimeSliced[0] > 23 || returnTimeSliced[1] < 0 || returnTimeSliced[1] > 59 || returnTimeSliced[0]<new Date().getHours() || (returnTimeSliced[0]==new Date().getHours() && returnTimeSliced[1]<new Date().getMinutes())){
        swal("Oops!", "Please enter delivery time in correct format")
        return false;
    } 
    return true;
}

function addDelivery(vehicleName,name,surName,phone,address,returnTime){
    returnTimeSplit = returnTime.split(':');

    let returnTimeAsDate = new Date();
    returnTimeAsDate.setHours(returnTimeSplit[0], returnTimeSplit[1]);
    let deliveryDriver = new DeliveryDriver(vehicle = vehicleName, name = name, surname = surName, telephone = phone, deliveryAddress = address, returnTimeAsDate);
    listOfDeliveryDrivers.push(deliveryDriver);

    let row = document.getElementById("deliveryTable").insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);

    cell1.innerHTML = `<i class="fa-solid fa-${deliveryDriver.vehicle.toLowerCase()} fa-2x align-center"></i>`
    cell2.innerHTML = deliveryDriver.name;
    cell3.innerHTML = deliveryDriver.surname;
    cell4.innerHTML = deliveryDriver.telephone;
    cell5.innerHTML = deliveryDriver.deliveryAddress;
    
    cell6.innerHTML = returnTime;

    $("#deliveryVehicleName").val(null);
    $("#deliveryName").val(null);
    $("#deliverySurName").val(null);
    $("#deliveryPhone").val(null);
    $("#deliveryAddress").val(null);
    $("#deliveryReturnTime").val(null);
};

function removeDeliveryDriver(driver){
    var index = listOfDeliveryDrivers.indexOf(driver);

    if (index > -1) {
      listOfDeliveryDrivers.splice(index, 1);
    }
    return listOfDeliveryDrivers;
};

function showDeliveryToast(deliveryDriverIndex){
    let title = "Delivery Driver"
    let description = `${listOfDeliveryDrivers[deliveryDriverIndex].name} ${listOfDeliveryDrivers[deliveryDriverIndex].surname}  was estimated to return from ${listOfDeliveryDrivers[deliveryDriverIndex].deliveryAddress} at ${listOfDeliveryDrivers[deliveryDriverIndex].returnTime.getHours()}:${listOfDeliveryDrivers[deliveryDriverIndex].returnTime.getMinutes()}. Phone Number: ${listOfDeliveryDrivers[deliveryDriverIndex].telephone}`;
    
    let toast = new myToast(listOfDeliveryDrivers[deliveryDriverIndex].vehicle,title, description)
    toast.show();
};