// 브라우저 LocalStorage에 저장되어 있는 자산 데이터를 가져온다.
// "assets"라는 이름으로 저장된 데이터가 있으면 문자열 형태로 가져온다.
const savedAssets = localStorage.getItem("assets");


// LocalStorage에 기존 자산 데이터가 있다면 JSON.parse()를 사용하여
// 문자열 데이터를 다시 JavaScript 배열로 변환한다.
// 저장된 데이터가 없다면 기본 자산 데이터를 사용한다.
let assets = savedAssets
    ? JSON.parse(savedAssets)
    : [
        {
            id: "LAPTOP-001",
            name: "삼성 노트북",
            type: "노트북",
            status: "사용 중",
            user: "김철수"
        }
    ];

// 현재 assets 배열의 데이터를 LocalStorage에 저장하는 함수
function saveAssets() {

    // LocalStorage에는 배열이나 객체를 그대로 저장할 수 없기 때문에
    // JSON.stringify()를 사용하여 문자열 형태로 변환한 뒤 저장한다.
    localStorage.setItem("assets", JSON.stringify(assets));
}

// 현재 어떤 자산을 수정 중인지 기억
let editingAssetId = null;

// HTML에서 자산 목록이 들어갈 tbody를 가져온다.
const assetTableBody = document.getElementById("assetTableBody");
const searchInput = document.getElementById("searchInput");

// 선택했을 때 자산 목록을 필터링하기 위해 사용한다.
const statusFilter = document.getElementById("statusFilter");

// 자산 목록을 화면에 출력하는 함수
// keyword : 검색창에 입력한 검색어
// status  : 사용자가 선택한 자산 상태
function renderAssets(keyword = "", status = "전체") {

    // 기존에 출력되어 있던 자산 목록을 모두 비운다.
    // 비우지 않으면 함수가 실행될 때마다 목록이 중복된다.
    assetTableBody.innerHTML = "";

    // assets 배열에서 검색어와 상태 조건을 모두 만족하는 자산만 가져온다.
    const filteredAssets = assets.filter(function(asset) {

        // 대소문자 구분 없이 검색하기 위해 검색어를 소문자로 변환한다.
        const searchText = keyword.toLowerCase();

        // 자산번호, 자산명, 종류, 사용자 중
        // 하나라도 검색어를 포함하고 있는지 확인한다.
        const matchesKeyword =
            asset.id.toLowerCase().includes(searchText) ||
            asset.name.toLowerCase().includes(searchText) ||
            asset.type.toLowerCase().includes(searchText) ||
            asset.user.toLowerCase().includes(searchText);

        // "전체"를 선택했다면 모든 상태를 허용한다.
        // 특정 상태를 선택했다면 해당 상태의 자산만 허용한다.
        const matchesStatus =
            status === "전체" || asset.status === status;

        // 검색 조건과 상태 조건을 모두 만족해야 목록에 표시한다.
        return matchesKeyword && matchesStatus;
    });

    // 필터링된 자산들을 하나씩 테이블에 출력한다.
    filteredAssets.forEach(function(asset) {

        // 새로운 테이블 행을 생성한다.
        const row = document.createElement("tr");

        // 자산 정보를 각 열에 넣는다.
        row.innerHTML = `
            <td>${asset.id}</td>
            <td>${asset.name}</td>
            <td>${asset.type}</td>
            <td>${asset.status}</td>
            <td>${asset.user}</td>
            <td>
                <button onclick="editAsset('${asset.id}')">수정</button>
                <button onclick="deleteAsset('${asset.id}')">삭제</button>
            </td>
        `;

        // 완성된 행을 자산 목록에 추가한다.
        assetTableBody.appendChild(row);
    });
}


// 검색창에 글자를 입력할 때마다 실행된다.
searchInput.addEventListener("input", function() {

    // 현재 검색어를 가져온다.
    const keyword = searchInput.value;

    // 현재 선택된 상태 필터 값을 가져온다.
    const status = statusFilter.value;

    // 검색어 + 상태 조건을 함께 적용하여 목록을 다시 출력한다.
    renderAssets(keyword, status);
});

// 상태 필터의 선택값이 변경될 때마다 실행된다.
statusFilter.addEventListener("change", function() {

    // 현재 검색창에 입력되어 있는 검색어를 가져온다.
    const keyword = searchInput.value;

    // 현재 선택한 상태 값을 가져온다.
    const status = statusFilter.value;

    // 검색어 + 상태 조건을 함께 적용하여 목록을 다시 출력한다.
    renderAssets(keyword, status);
});



// 등록 버튼을 가져온다.
const addAssetButton = document.getElementById("addAssetButton");


// 등록 버튼을 클릭했을 때 실행된다.
addAssetButton.addEventListener("click", function() {

    // 입력창에 작성된 값을 가져온다.
    const id = document.getElementById("assetId").value;
    const name = document.getElementById("assetName").value;
    const type = document.getElementById("assetType").value;
    const status = document.getElementById("assetStatus").value;
    const user = document.getElementById("assetUser").value;
    
    // ==================================================
    // 빈칸 등록 방지
    // ==================================================

    // 자산번호 또는 자산명이 비어있으면 등록하지 않는다.
    if (id.trim() === "" || name.trim() === "") {

        alert("자산번호와 자산명을 입력해주세요.");

        // 아래 등록 코드가 실행되지 않도록 함수 종료
        return;
    }

    // 수정 모드인 경우
    if (editingAssetId !== null) {

        const asset = assets.find(function(asset) {
            return asset.id === editingAssetId;
        });

        if (asset) {
            asset.id = id;
            asset.name = name;
            asset.type = type;
            asset.status = status;
            asset.user = user;
        }

        // 수정된 자산 정보를 LocalStorage에 저장한다.
        // 새로고침해도 수정된 내용이 유지되도록 한다.
        saveAssets();

        editingAssetId = null;

        addAssetButton.textContent = "등록";

        renderAssets();
        updateDashboard();

        document.getElementById("assetId").value = "";
        document.getElementById("assetName").value = "";
        document.getElementById("assetUser").value = "";

        return;
    }


    // ==================================================
    // 자산번호 중복 등록 방지
    // =================================================

    // assets 배열에서 입력한 자산번호와 같은 자산이 있는지 찾는다.
    const duplicateAsset = assets.find(function(asset) {
        return asset.id === id;
    });

    // 같은 자산번호가 이미 존재하면 등록하지 않는다.
    if (duplicateAsset) {
        alert("이미 등록된 자산번호입니다.");
        return;
    }

    // 새로운 자산 객체 생성
    const newAsset = {
        id: id,
        name: name,
        type: type,
        status: status,
        user: user
    };



    // assets 배열에 새로운 자산을 추가한다.
    assets.push(newAsset);

    // 변경된 전체 자산 목록을 LocalStorage에 저장한다.
    saveAssets();

    // 변경된 assets 배열을 기준으로
    // 자산 목록을 화면에 다시 출력한다.
    renderAssets();

    // 5. 대시보드 숫자 갱신
    updateDashboard();

    // 6. 입력창 초기화
    document.getElementById("assetId").value = "";
    document.getElementById("assetName").value = "";
    document.getElementById("assetUser").value = "";
});  

// 대시보드의 자산 개수를 업데이트하는 함수
function updateDashboard() {

    // 전체 자산 개수
    const totalCount = assets.length;

    // 상태가 "사용 중"인 자산 개수
    const usingCount = assets.filter(function(asset) {
        return asset.status === "사용 중";
    }).length;

    // 상태가 "대여 가능"인 자산 개수
    const availableCount = assets.filter(function(asset) {
        return asset.status === "대여 가능";
    }).length;

    // 상태가 "수리 중"인 자산 개수
    const repairCount = assets.filter(function(asset) {
        return asset.status === "수리 중";
    }).length;


    // 계산한 숫자를 HTML에 표시
    document.getElementById("totalCount").textContent = totalCount;
    document.getElementById("usingCount").textContent = usingCount;
    document.getElementById("availableCount").textContent = availableCount;
    document.getElementById("repairCount").textContent = repairCount;
}

// 선택한 자산을 삭제하는 함수
function deleteAsset(id) {

    // 사용자에게 정말 삭제할 것인지 확인한다.
    // 확인을 누르면 true, 취소를 누르면 false가 저장된다.
    const isConfirmed = confirm("정말 이 자산을 삭제하시겠습니까?");

    // 사용자가 취소를 눌렀다면 삭제하지 않고 함수를 종료한다.
    if (!isConfirmed) {
        return;
    }

    // 전달받은 자산번호(id)와 같은 자산의 위치를 찾는다.
    const index = assets.findIndex(function(asset) {
        return asset.id === id;
    });

    // 해당 자산이 존재하는 경우에만 삭제한다.
    if (index !== -1) {

        // assets 배열에서 해당 자산 1개를 삭제한다.
        assets.splice(index, 1);

        // 삭제된 상태를 LocalStorage에 다시 저장한다.
        // 따라서 새로고침해도 삭제된 상태가 유지된다.
        saveAssets();
    }

    // 삭제된 자산을 반영하여 목록을 다시 출력한다.
    renderAssets(searchInput.value, statusFilter.value);

    // 대시보드의 전체 자산 수와 상태별 개수를 다시 계산한다.
    updateDashboard();
}

      // 삭제된 배열 기준으로 화면 다시 출력
    renderAssets();

    // 대시보드 숫자도 갱신
    updateDashboard();

    function editAsset(id) {

    // 수정할 자산 찾기
    const asset = assets.find(function(asset) {
        return asset.id === id;
    });

    // 자산이 없으면 함수 종료
    if (!asset) {
        return;
    }

    // 현재 수정 중인 자산번호 저장
    editingAssetId = id;

    // 수정 모드일 때 버튼 이름 변경
    addAssetButton.textContent = "수정 저장";

    // 기존 자산 정보를 입력창에 다시 넣는다.
    document.getElementById("assetId").value = asset.id;
    document.getElementById("assetName").value = asset.name;
    document.getElementById("assetType").value = asset.type;
    document.getElementById("assetStatus").value = asset.status;
    document.getElementById("assetUser").value = asset.user;
}
