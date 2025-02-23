// import { LightningElement, wire, track } from 'lwc';
// import getAppointmentsForBanker from '@salesforce/apex/BankerController.getAppointmentsForBanker';

// export default class BankerAppointmentsList extends LightningElement {
//     @track appointments = [];

//     @wire(getAppointmentsForBanker)
//     wiredAppointments({ data, error }) {
//         if (data) {
//             this.appointments = data.map(appt => ({
//                 Id: appt.Id,
//                 CustomerName: appt.Contact__c ? appt.Contact__c.Name : 'N/A',
//                 FormattedDate: new Date(appt.Appointment_Date_and_Time__c).toLocaleString(),
//                 Appointment_Reason__c: appt.Name,
//                 Duration__c: appt.Duration__c,
//                 Appointment_Location__c:appt.Appointment_Location__c,
//                 Pincode__c : appt.Pincode__c 
                
//             }));
//         } else if (error) {
//             console.error('Error fetching appointments:', error);
//         }
//     }
// }


import { LightningElement, wire, track } from 'lwc';
import getAppointmentsForBanker from '@salesforce/apex/BankerController.getAppointmentsForBanker';

const COLUMNS = [
    { label: 'Customer', fieldName: 'CustomerName', type: 'text' },
    { label: 'Date and Time', fieldName: 'FormattedDate', type: 'text' },
    { label: 'Purpose', fieldName: 'Name', type: 'text' },
    { label: 'Duration', fieldName: 'Duration__c', type: 'number' },
    { label: 'Location', fieldName: 'Appointment_Location__c', type: 'text' },
    { label: 'Pincode', fieldName: 'Pincode__c', type: 'text' }
];

export default class UpcomingAppointments extends LightningElement {
    @track appointments = [];
    columns = COLUMNS;

    @wire(getAppointmentsForBanker)
    wiredAppointments({ data, error }) {
        if (data) {
            this.appointments = data.map(appt => ({
                Id: appt.Id,
                CustomerName: appt.Customer__r ? appt.Customer__r.Name : 'N/A',
                FormattedDate: new Date(appt.Appointment_Date_and_Time__c).toLocaleString(),
                Name: appt.Name,
                Duration__c: appt.Duration__c,
                Appointment_Location__c: appt.Appointment_Location__c,
                Pincode__c: appt.Pincode__c
            }));
        } else if (error) {
            console.error('Error fetching appointments:', error);
        }
    }
}
