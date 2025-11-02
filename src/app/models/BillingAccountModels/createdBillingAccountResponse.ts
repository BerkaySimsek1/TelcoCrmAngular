export interface CreatedBillingAccountResponse{
    id:number;
    customerId: string;
    addressId:number;
    type:string;
    status:string;
    accountNumber:string;
    accountName:string;
}