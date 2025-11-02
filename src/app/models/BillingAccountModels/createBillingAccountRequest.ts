export interface CreateBillingAccountRequest{
    customerId: string;
    addressId:number;
    accountNumber?:string;
    accountName:string;
}