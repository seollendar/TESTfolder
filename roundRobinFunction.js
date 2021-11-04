let partitionNumber = 0;
const partitioning = () => {
   const newPartitionNumber = ++partitionNumber % 5;
   partitionNumber = newPartitionNumber == 0 ? 0 : newPartitionNumber;
   //console.log({ partitionNumber, newPartitionNumber });
   return newPartitionNumber;
};

for (let i = 0; i < 10; i++) {
   console.log(i, partitioning());
}
