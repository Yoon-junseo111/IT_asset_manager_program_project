const assets = [
    {
        id: "LAPTOP-001",
        name: "삼성 노트북",
        type: "노트북",
        status: "사용 중",
        user: "김철수"
    }
];

// HTML에서 자산 목록이 들어갈 tbody를 가져온다.
const assetTableBody = document.getElementById("assetTableBody");


// 자산 목록을 화면에 출력하는 함수
function renderAssets() {

    // 기존에 화면에 표시된 목록을 모두 비운다.
    assetTableBody.innerHTML = "";

    // assets 배열의 자산을 하나씩 화면에 출력한다.
    assets.forEach(function(asset) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${asset.id}</td>
            <td>${asset.name}</td>
            <td>${asset.type}</td>
            <td>${asset.status}</td>
            <td>${asset.user}</td>
            <td>
                <button onclick="deleteAsset('${asset.id}')">삭제</button>
            </td>
        `;

        assetTableBody.appendChild(row);
    });
}

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

function deleteAsset(id) {

    // 삭제할 자산의 위치를 찾는다.
    const index = assets.findIndex(function(asset) {
        return asset.id === id;
    });

    // 자산을 찾았다면 배열에서 삭제한다.
    if (index !== -1) {
        assets.splice(index, 1);
    }

     renderAssets();
     updateDashboard();
}

      // 삭제된 배열 기준으로 화면 다시 출력
    renderAssets();

    // 대시보드 숫자도 갱신
    updateDashboard();
