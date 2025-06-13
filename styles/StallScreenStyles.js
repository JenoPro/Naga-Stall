import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Web-specific container
  webContainer: {
    flex: 1,
    width: '95%',
    maxWidth: '95%',
    alignSelf: 'stretch',
  },
  // Main content area with space for sidebar
  content: {
    flex: 1,
    marginLeft: 80, // Fixed space for the navbar
    padding: 30,
    width: '100%',
    maxWidth: '100%',
  },
  // Web Header Styles
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
    borderRadius: 8,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  // Mobile Header Styles (existing)
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 13,
    color: "#555",
  },
  stallBadge: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontWeight: "bold",
    marginRight: 5,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  // FlatList Styles
  flatList: {
    flex: 1,
    width: '100%',
  },
  webFlatList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0, // Remove extra padding since we have content padding
  },
  list: {
    padding: 15,
    paddingBottom: 80, // Add space for bottom navigation on mobile
  },
  webList: {
    padding: 0, // Remove padding since we have content padding
    paddingBottom: 20,
  },
  // Grid row style for web - UPDATED FOR LEFT ALIGNMENT
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from 'space-around' to 'flex-start'
    alignItems: 'flex-start',
    paddingHorizontal: 0,        // Removed horizontal padding
    flexWrap: 'wrap',            // Allow items to wrap
  },
  // Loading and No Data States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
  },
  // Popup and Modal Styles
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filterBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  autoRefreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    minWidth: 70,
    alignItems: "center",
  },
  autoRefreshText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    backgroundColor: "#f0f8ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#2563eb",
    fontStyle: "italic",
  },
});

export default styles;