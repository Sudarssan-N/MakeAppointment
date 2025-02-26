import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/BankerController.createAppointment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ScheduleAppointment extends LightningElement {
    @track customerId;
    @track appointmentDateTime;
    @track purpose;

    purposeOptions = [
        { label: 'Loan Inquiry', value: 'Loan Inquiry' },
        { label: 'Account Opening', value: 'Account Opening' },
        { label: 'Investment Advice', value: 'Investment Advice' }
    ];

    handleInputChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleSchedule() {
        if (!this.customerId || !this.appointmentDateTime || !this.purpose) {
            this.showToast('Error', 'All fields are required!', 'error');
            return;
        }

        let newAppt = {
            Customer__c: this.customerId,
            Banker__c: '', // Auto-set in Apex using UserInfo.getUserId()
            Appointment_Date_Time__c: this.appointmentDateTime,
            Purpose__c: this.purpose,
            Status__c: 'Scheduled'
        };

        createAppointment({ newAppt })
            .then(() => {
                this.showToast('Success', 'Appointment Scheduled', 'success');
                this.customerId = '';
                this.appointmentDateTime = '';
                this.purpose = '';
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}