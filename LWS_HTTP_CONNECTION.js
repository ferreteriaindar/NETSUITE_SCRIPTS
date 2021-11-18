/**
 *@NApiVersion 2.x
 * @NModuleScope Public
 * @Company INDAR
 * @Author ROBERTO VELASCO Larios
 * @Name HTTP Connection
 */
 define(['N/http', 'N/log'], function(http, log) {

    var httpService = {};
    httpService.get = function(url){
        var header = [];
        header['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6IkxXUyIsIlJvbGUiOiJBRE1JTiIsImp0aSI6IjNkYzYzMGY5LTM2ZGEtNDU2My1hYzg1LTg3YWJiMGVjNzkxMiIsImV4cCI6MTc5MjYxMTE3MCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMzYvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMzYvIn0.o1xaW9FTcFkvxyXp3rs5jtGXMUw-sfnhbtA5K7b1jXY';
        try {
            var response = http.get({
                url: 'http://indariws.dyndns.org:64444/'+url,
                headers: header
            });
        }
        catch (e) {
            log.error('HTTP ERROR', e);
        }
    };
    httpService.post = function(url,body){
        var header = [];
        header['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6IkxXUyIsIlJvbGUiOiJBRE1JTiIsImp0aSI6IjNkYzYzMGY5LTM2ZGEtNDU2My1hYzg1LTg3YWJiMGVjNzkxMiIsImV4cCI6MTc5MjYxMTE3MCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMzYvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMzYvIn0.o1xaW9FTcFkvxyXp3rs5jtGXMUw-sfnhbtA5K7b1jXY';
        header['Content-Type'] = 'application/json';
        try{
            var response = http.post({
            //    url: 'http://187.190.52.195:63333/'+url,
                url: 'http://indariws.dyndns.org:64444/'+url,
                body: body,
                headers: header
            });
        }
        catch (e) {
            log.error('HTTP ERROR', e);
        }
    };
    return httpService;
});