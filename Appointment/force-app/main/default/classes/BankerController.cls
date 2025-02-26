public with sharing class BankerController {
    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getAppointmentsForBanker() {
        Id bankerId = 'a08dM00000DFfZdQAL';
        return [
            SELECT Id, Name,  Contact__c, Contact__r.Name, Appointment_Reason__c, Appointment_Date_and_Time__c, Duration__c, Appointment_Location__c, Pincode__c, Banker__c
            FROM Appointment__c
            WHERE Banker__c = :bankerId
            //AND Appointment_Date_and_Time__c >= TODAY
            ORDER BY Appointment_Date_and_Time__c ASC
        ];
    }
    
    @AuraEnabled
    public static Appointment__c createAppointment(Appointment__c newAppt) {
        insert newAppt;
        return newAppt;
    }
}