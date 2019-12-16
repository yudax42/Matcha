

window.onload = async function fetchStats() {
    var stateData = await axios.get('/admin/backDoor/statistics');
    $("#usersCount").html(" " +stateData.data.stateData.totalUsers);
    $("#onlineUsersCount").html(" " +stateData.data.stateData.totalOnlineUsers);
    $("#totalReportsCount").html(" " +stateData.data.stateData.totalReports);
    $("#matchedUsersCount").html(" " +stateData.data.stateData.totalMatched);
}