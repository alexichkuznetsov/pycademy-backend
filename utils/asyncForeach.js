module.exports = async (arr, callback) => {
	for (let i = 0, length = arr.length; i < length; i++) {
		await callback(arr[i], i, arr);
	}
};
