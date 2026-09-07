// ========================================
// 자산 데이터 불러오기
// ========================================

// LocalStorage에 저장된 자산 데이터를 불러온다.
// 저장된 데이터가 없으면 기본 자산 1개를 사용한다.
let assets = JSON.parse(localStorage.getItem("assets")) || [
    {
        id: "LAPTOP-001",
        name: "삼성 노트북",
        type: "노트북",
        status: "사용 중",
        user: "김철수",
        rentalDate: "2026-09-01",
        returnDate: "2026-09-30"
    }
];


// ========================================
// 대여 이력 데이터 불러오기
// ========================================

// LocalStorage에 저장된 대여 이력을 불러온다.
// 저장된 이력이 없으면 빈 배열을 사용한다.
let rentalHistory =
    JSON.parse(localStorage.getItem("rentalHistory")) || [];


// ========================================
// LocalStorage 저장
// ========================================

// 현재 자산 데이터를 LocalStorage에 저장한다.
function saveAssets() {

    localStorage.setItem(
        "assets",
        JSON.stringify(assets)
    );
}

// 자산의 반납 상태를 확인하는 함수
function getRentalStatus(asset) {

    // 현재 대여 중이 아니거나 반납 예정일이 없으면 일반 상태
    if (asset.status !== "사용 중" || !asset.returnDate) {
        return "normal";
    }

    // 오늘 날짜 가져오기
    const today = new Date();

    // 자산의 반납 예정일 가져오기
    const dueDate = new Date(asset.returnDate);

    // 오늘과 반납 예정일의 시간 차이 계산
    const diffTime = dueDate - today;

    // 시간 차이를 일(day) 단위로 변환
    const diffDays = Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
    );

    // 반납 예정일이 이미 지났다면 반납 지연
    if (diffDays < 0) {
        return "overdue";
    }

    // 반납 예정일까지 3일 이하라면 반납 예정
    if (diffDays <= 3) {
        return "dueSoon";
    }

    // 그 외에는 일반 상태
    return "normal";
}

// ========================================
// 대여 이력 LocalStorage 저장
// ========================================

// 대여 이력 데이터를 LocalStorage에 저장한다.
function saveRentalHistory() {

    localStorage.setItem(
        "rentalHistory",
        JSON.stringify(rentalHistory)
    );
}

// ========================================
// 대여 이력 출력
// ========================================

function renderRentalHistory() {

    // 기존 대여 이력 화면을 초기화한다.
    rentalHistoryTableBody.innerHTML = "";


    // 저장된 대여 이력을 하나씩 화면에 출력한다.
    rentalHistory.forEach(history => {

        // 새로운 테이블 행을 만든다.
        const row =
            document.createElement("tr");


        // 대여 이력 정보를 테이블에 출력한다.
        row.innerHTML = `

            <td>
                ${history.assetId}
            </td>

            <td>
                ${history.assetName}
            </td>

            <td>
                ${history.user}
            </td>

            <td>
                ${history.rentalDate}
            </td>

            <td>
                ${history.dueDate}
            </td>

            <td>
                ${history.actualReturnDate}
            </td>

        `;


        // 만들어진 행을 테이블에 추가한다.
        rentalHistoryTableBody.appendChild(row);

    });
}


// ========================================
// 수정 상태
// ========================================

// 현재 수정 중인 자산의 ID를 저장한다.
// 수정 중이 아니면 null이다.
let editingAssetId = null;


// ========================================
// HTML 요소 가져오기
// ========================================

// 자산 목록의 tbody 요소를 가져온다.
const assetTableBody =
    document.getElementById("assetTableBody");

// 검색 입력창을 가져온다.
const searchInput =
    document.getElementById("searchInput");

// 상태 필터 선택창을 가져온다.
const statusFilter =
    document.getElementById("statusFilter");

// 대여 이력 테이블의 tbody 요소를 가져온다.
const rentalHistoryTableBody =
    document.getElementById("rentalHistoryTableBody");

// 반납 예정 
const dueSoonCount = 
    document.getElementById("dueSoonCount");

// 반납 지연 대시보드 요소
const overdueCount = 
    document.getElementById("overdueCount");

// ========================================
// 자산 목록 출력
// ========================================

function renderAssets(keyword = "", status = "전체") {

    // 기존 자산 목록을 초기화한다.
    assetTableBody.innerHTML = "";


    // 검색어와 상태에 맞는 자산만 필터링한다.
    const filteredAssets = assets.filter(asset => {

        // 검색어를 소문자로 변경한다.
        const searchText =
            keyword.toLowerCase();


        // 자산번호, 자산명, 종류, 사용자를 검색한다.
        const matchesKeyword =

            asset.id.toLowerCase()
                .includes(searchText) ||

            asset.name.toLowerCase()
                .includes(searchText) ||

            asset.type.toLowerCase()
                .includes(searchText) ||

            (asset.user || "")
                .toLowerCase()
                .includes(searchText);


        // 상태 필터 조건을 확인한다.
        const matchesStatus =

            status === "전체" ||
            asset.status === status;


        // 검색어와 상태 조건을 모두 만족하는 자산만 반환한다.
        return matchesKeyword && matchesStatus;
    });


    // 필터링된 자산을 하나씩 화면에 출력한다.
    filteredAssets.forEach(asset => {

        // 새로운 테이블 행을 만든다.
        const row =
            document.createElement("tr");


        // 자산 정보를 테이블에 출력한다.
        row.innerHTML = `

            <td>${asset.id}</td>

            <td>${asset.name}</td>

            <td>${asset.type}</td>

            <td>
                ${asset.status}

                ${
                    // 반납 예정 상태라면 표시
                    getRentalStatus(asset) === "dueSoon"
                        ? "/ 반납 예정"

                    // 반납 지연 상태라면 표시
                    : getRentalStatus(asset) === "overdue"
                        ? " / ⚠ 반납 지연"

                    // 일반 상태라면 아무것도 표시하지 않음
                    : ""
                }
            </td>

            <td>${asset.user || "-"}</td>

            <td>${asset.rentalDate || "-"}</td>

            <td>${asset.returnDate || "-"}</td>


            <td>

                <!-- 자산 수정 버튼 -->
                <button onclick="editAsset('${asset.id}')">
                    수정
                </button>
                
                <!-- 자산 상세 버튼 -->
                <button onclick="showAssetDetail('${asset.id}')">
                    상세
                </button>

                ${
                    // 대여 가능한 자산만 대여 버튼을 표시한다.
                    asset.status === "대여 가능"

                    ? `
                        <button onclick="rentAsset('${asset.id}')">
                            대여
                        </button>
                    `

                    : ""
                }


                ${
                    // 사용 중인 자산만 반납 버튼을 표시한다.
                    asset.status === "사용 중"

                    ? `
                        <button onclick="returnAsset('${asset.id}')">
                            반납
                        </button>
                    `

                    : ""
                }
                

                <!-- 자산 삭제 버튼 -->
                <button onclick="deleteAsset('${asset.id}')">
                    삭제
                </button>

            </td>
        `;


        // 만들어진 행을 테이블에 추가한다.
        assetTableBody.appendChild(row);
    });
}


// ========================================
// 검색 기능
// ========================================

// 검색창에 입력할 때마다 자산 목록을 다시 출력한다.
searchInput.addEventListener("input", () => {

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

});


// ========================================
// 상태 필터
// ========================================

// 상태 필터가 변경될 때마다 자산 목록을 다시 출력한다.
statusFilter.addEventListener("change", () => {

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

});


// ========================================
// 자산 등록 / 수정
// ========================================

// 등록 버튼을 클릭했을 때 실행된다.
document
    .getElementById("addAssetButton")
    .addEventListener("click", () => {


        // 입력한 자산번호를 가져온다.
        const assetId =
            document.getElementById("assetId")
                .value
                .trim();


        // 입력한 자산명을 가져온다.
        const assetName =
            document.getElementById("assetName")
                .value
                .trim();


        // 선택한 자산 종류를 가져온다.
        const assetType =
            document.getElementById("assetType")
                .value;


        // 선택한 자산 상태를 가져온다.
        const assetStatus =
            document.getElementById("assetStatus")
                .value;


        // 입력한 사용자를 가져온다.
        const assetUser =
            document.getElementById("assetUser")
                .value
                .trim();


        // ========================================
        // 필수값 확인
        // ========================================

        // 자산번호 또는 자산명이 비어 있으면 등록하지 않는다.
        if (!assetId || !assetName) {

            alert(
                "자산번호와 자산명은 필수입니다."
            );

            return;
        }


        // ========================================
        // 자산 수정
        // ========================================

        // editingAssetId가 null이 아니라면
        // 현재 자산을 수정하고 있는 상태이다.
        if (editingAssetId !== null) {

            // 수정할 자산을 찾는다.
            const asset =
                assets.find(
                    item => item.id === editingAssetId
                );


            // 자산이 존재하는 경우 수정한다.
            if (asset) {

                // 자산번호를 수정한다.
                asset.id = assetId;

                // 자산명을 수정한다.
                asset.name = assetName;

                // 자산 종류를 수정한다.
                asset.type = assetType;

                // 자산 상태를 수정한다.
                asset.status = assetStatus;

                // 사용자를 수정한다.
                asset.user = assetUser;


                // 수정된 데이터를 저장한다.
                saveAssets();


                // 수정 상태를 종료한다.
                editingAssetId = null;


                // 버튼 문구를 다시 "등록"으로 변경한다.
                document
                    .getElementById("addAssetButton")
                    .textContent = "등록";


                // 자산 목록을 다시 출력한다.
                renderAssets(
                    searchInput.value,
                    statusFilter.value
                );


                // 대시보드를 업데이트한다.
                updateDashboard();


                // 입력창을 초기화한다.
                clearForm();
            }


            // 수정 작업이 끝났으므로 함수를 종료한다.
            return;
        }


        // ========================================
        // 중복 자산번호 확인
        // ========================================

        // 이미 같은 자산번호가 있는지 확인한다.
        const duplicate =
            assets.some(
                asset => asset.id === assetId
            );


        // 중복 자산번호라면 등록하지 않는다.
        if (duplicate) {

            alert(
                "이미 존재하는 자산번호입니다."
            );

            return;
        }


        // ========================================
        // 신규 자산 등록
        // ========================================

        // 새로운 자산 객체를 만든다.
        const newAsset = {

            // 자산번호
            id: assetId,

            // 자산명
            name: assetName,

            // 자산 종류
            type: assetType,

            // 자산 상태
            status: assetStatus,

            // 사용자
            user: assetUser,

            // 아직 대여하지 않았으므로 대여일은 비워둔다.
            rentalDate: "",

            // 아직 대여하지 않았으므로 반납 예정일도 비워둔다.
            returnDate: ""
        };


        // 자산 목록에 새로운 자산을 추가한다.
        assets.push(newAsset);


        // LocalStorage에 저장한다.
        saveAssets();


        // 자산 목록을 다시 출력한다.
        renderAssets(
            searchInput.value,
            statusFilter.value
        );


        // 대시보드를 업데이트한다.
        updateDashboard();


        // 입력창을 초기화한다.
        clearForm();

    });


// ========================================
// 입력창 초기화
// ========================================

function clearForm() {

    // 자산번호 입력창을 비운다.
    document.getElementById("assetId").value = "";


    // 자산명 입력창을 비운다.
    document.getElementById("assetName").value = "";


    // 사용자 입력창을 비운다.
    document.getElementById("assetUser").value = "";

}


// ========================================
// 대시보드 업데이트
// ========================================

function updateDashboard() {

    // 전체 자산 개수를 계산한다.
    const total =
        assets.length;


    // 사용 중인 자산 개수를 계산한다.
    const using =
        assets.filter(
            asset => asset.status === "사용 중"
        ).length;


    // 대여 가능한 자산 개수를 계산한다.
    const available =
        assets.filter(
            asset => asset.status === "대여 가능"
        ).length;


    // 수리 중인 자산 개수를 계산한다.
    const repair =
        assets.filter(
            asset => asset.status === "수리 중"
        ).length;


    // 반납 예정 자산 개수를 계산한다.
    const dueSoon =
        assets.filter(
            asset => getRentalStatus(asset) === "dueSoon"
        ).length;


    // 반납 지연 자산 개수를 계산한다.
    const overdue =
        assets.filter(
            asset => getRentalStatus(asset) === "overdue"
        ).length;


    // 전체 자산 숫자를 화면에 표시한다.
    document.getElementById("totalCount").textContent =
        total;


    // 사용 중인 자산 숫자를 화면에 표시한다.
    document.getElementById("usingCount").textContent =
        using;


    // 대여 가능한 자산 숫자를 화면에 표시한다.
    document.getElementById("availableCount").textContent =
        available;


    // 수리 중인 자산 숫자를 화면에 표시한다.
    document.getElementById("repairCount").textContent =
        repair;


    // 반납 예정 자산 숫자를 화면에 표시한다.
    dueSoonCount.textContent =
        dueSoon;


    // 반납 지연 자산 숫자를 화면에 표시한다.
    overdueCount.textContent =
        overdue;
}


// 자산 상세 정보
function showAssetDetail(id) {

    // 해당 ID의 자산을 찾는다.
    const asset = assets.find(item => item.id === id);

    // 자산이 없으면 종료한다.
    if (!asset) {
        alert("자산을 찾을 수 없습니다.");
        return;
    }

    // 해당 자산의 대여 이력만 가져온다.
    const history = rentalHistory.filter(
        item => item.assetId === asset.id
    );

    // 대여 이력 HTML 생성
    let historyHTML = "";

    if (history.length === 0) {

        historyHTML = "<p>대여 이력이 없습니다.</p>";

    } else {

        historyHTML = history.map(item => `
            <div class="history-item">
                <p><strong>사용자:</strong> ${item.user}</p>
                <p><strong>대여일:</strong> ${item.rentalDate}</p>
                <p><strong>반납 예정일:</strong> ${item.dueDate}</p>
                <p><strong>실제 반납일:</strong> ${item.actualReturnDate}</p>
                <hr>
            </div>
        `).join("");
    }

    // 상세 정보 출력
    const detailContent = document.getElementById("assetDetailContent");

    detailContent.innerHTML = `
        <p><strong>자산 ID:</strong> ${asset.id}</p>
        <p><strong>자산명:</strong> ${asset.name}</p>
        <p><strong>유형:</strong> ${asset.type}</p>
        <p><strong>상태:</strong> ${asset.status}</p>
        <p><strong>사용자:</strong> ${asset.user || "-"}</p>
        <p><strong>대여일:</strong> ${asset.rentalDate || "-"}</p>
        <p><strong>반납 예정일:</strong> ${asset.returnDate || "-"}</p>

        <hr>

        <h3>대여 이력</h3>

        ${historyHTML}
    `;

    // 모달 표시
    const modal = document.getElementById("assetDetailModal");

    modal.style.display = "flex";
}

function closeAssetDetail() {

    const modal = document.getElementById("assetDetailModal");

    modal.style.display = "none";
}

// ========================================
// 자산 삭제
// ========================================

function deleteAsset(id) {

    // 삭제 여부를 사용자에게 확인한다.
    const confirmed =
        confirm(
            "정말 이 자산을 삭제하시겠습니까?"
        );


    // 사용자가 취소하면 삭제하지 않는다.
    if (!confirmed) {
        return;
    }


    // 삭제할 자산의 위치를 찾는다.
    const index =
        assets.findIndex(
            asset => asset.id === id
        );


    // 자산이 존재하는 경우 삭제한다.
    if (index !== -1) {

        // 배열에서 자산을 삭제한다.
        assets.splice(index, 1);


        // 변경된 데이터를 저장한다.
        saveAssets();


        // 자산 목록을 다시 출력한다.
        renderAssets(
            searchInput.value,
            statusFilter.value
        );


        // 대시보드를 업데이트한다.
        updateDashboard();
    }
}


// ========================================
// 자산 수정
// ========================================

function editAsset(id) {

    // 수정할 자산을 찾는다.
    const asset =
        assets.find(
            item => item.id === id
        );


    // 자산이 없으면 종료한다.
    if (!asset) {
        return;
    }


    // 현재 자산 ID를 수정 상태에 저장한다.
    editingAssetId = id;


    // 자산번호 입력창에 기존 자산번호를 넣는다.
    document.getElementById("assetId").value =
        asset.id;


    // 자산명 입력창에 기존 자산명을 넣는다.
    document.getElementById("assetName").value =
        asset.name;


    // 자산 종류 선택창에 기존 종류를 넣는다.
    document.getElementById("assetType").value =
        asset.type;


    // 상태 선택창에 기존 상태를 넣는다.
    document.getElementById("assetStatus").value =
        asset.status;


    // 사용자 입력창에 기존 사용자를 넣는다.
    document.getElementById("assetUser").value =
        asset.user || "";


    // 버튼 문구를 "수정 저장"으로 변경한다.
    document
        .getElementById("addAssetButton")
        .textContent = "수정 저장";
}


// ========================================
// 자산 대여
// ========================================

function rentAsset(id) {

    // 대여할 자산을 찾는다.
    const asset =
        assets.find(
            item => item.id === id
        );


    // 자산이 없으면 종료한다.
    if (!asset) {
        return;
    }


    // 대여할 사용자의 이름을 입력받는다.
    const user =
        prompt(
            "대여할 사용자를 입력하세요."
        );


    // 사용자를 입력하지 않았다면 종료한다.
    if (!user) {
        return;
    }


    // 반납 예정일을 입력받는다.
    const returnDate =
        prompt(
            "반납 예정일을 입력하세요. (예: 2026-09-30)"
        );


    // 반납 예정일을 입력하지 않았다면 종료한다.
    if (!returnDate) {
        return;
    }


    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져온다.
    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    // ========================================
    // 대여 정보 저장
    // ========================================

    // 자산 상태를 사용 중으로 변경한다.
    asset.status = "사용 중";


    // 대여한 사용자를 저장한다.
    asset.user = user;


    // 대여 날짜를 저장한다.
    asset.rentalDate = today;


    // 반납 예정일을 저장한다.
    asset.returnDate = returnDate;


    // 변경된 자산 데이터를 저장한다.
    saveAssets();


    // 자산 목록을 다시 출력한다.
    renderAssets(
        searchInput.value,
        statusFilter.value
    );


    // 대시보드를 업데이트한다.
    updateDashboard();


    // 대여 완료 메시지를 표시한다.
    alert(
        "자산이 대여되었습니다."
    );
}


// ========================================
// 자산 반납
// ========================================

function returnAsset(id) {

    // 반납할 자산을 찾는다.
    const asset =
        assets.find(
            item => item.id === id
        );


    // 자산이 없으면 종료한다.
    if (!asset) {
        return;
    }


    // 반납 여부를 사용자에게 확인한다.
    const confirmed =
        confirm(
            `${asset.name}을(를) 반납 처리하시겠습니까?`
        );


    // 사용자가 취소하면 반납하지 않는다.
    if (!confirmed) {
        return;
    }


    // ========================================
    // 실제 반납 날짜
    // ========================================

    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져온다.
    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    // ========================================
    // 대여 이력 저장
    // ========================================

    // 현재 자산에 저장된 대여 정보를
    // 반납하기 전에 대여 이력에 저장한다.
    rentalHistory.push({

        // 자산번호
        assetId: asset.id,

        // 자산명
        assetName: asset.name,

        // 대여한 사용자
        user: asset.user,

        // 실제 대여 날짜
        rentalDate: asset.rentalDate,

        // 반납 예정일
        dueDate: asset.returnDate,

        // 실제 반납한 날짜
        actualReturnDate: today
    });


    // ========================================
    // 현재 자산 상태 변경
    // ========================================

    // 반납했으므로 다시 대여 가능한 상태로 변경한다.
    asset.status = "대여 가능";


    // 현재 사용자를 초기화한다.
    asset.user = "";


    // 현재 대여 날짜를 초기화한다.
    asset.rentalDate = "";


    // 현재 반납 예정일을 초기화한다.
    asset.returnDate = "";


    // ========================================
    // 데이터 저장
    // ========================================

    // 변경된 자산 데이터를 LocalStorage에 저장한다.
    saveAssets();


    // 새롭게 추가된 대여 이력을 LocalStorage에 저장한다.
    saveRentalHistory();


    // ========================================
    // 화면 업데이트
    // ========================================

    // 자산 목록을 다시 출력한다.
    renderAssets(
        searchInput.value,
        statusFilter.value
    );


    // 대시보드를 업데이트한다.
    updateDashboard();


    // 반납 완료 메시지를 표시한다.
    alert(
        "자산이 반납되었습니다."
    );
}


// ========================================
// 프로그램 시작
// ========================================

// 프로그램이 시작되면 자산 목록을 화면에 출력한다.
renderAssets();


// 프로그램이 시작되면 대시보드를 업데이트한다.
updateDashboard();


// 대여 이력 출력
renderRentalHistory();

// 모달 바깥쪽을 클릭하면 모달을 닫는다.
window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("assetDetailModal");

    if (event.target === modal) {
        closeAssetDetail();
    }

});