describe("mailcheck", function() {
    var domains = ['yahoo.com', 'yahoo.com.tw', 'google.com','hotmail.com', 'gmail.com', 'emaildomain.com'];

  describe("jquery.mailcheck", function () {
    var suggestedSpy, emptySpy;

    beforeEach(function() {
      $('body').append('<div id="playground"></div>');

      suggestedSpy = jasmine.createSpy();
      emptySpy = jasmine.createSpy();

      $('#playground').append('<input type="text" id="test-input"/>');
    });

    afterEach(function() {
      $('#playground').remove();
    });

    it("calls the 'suggested' callback with the element and result when there's a suggestion", function () {
      $("#test-input").val('test@hotmail.co').mailcheck({
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).toHaveBeenCalledWith($("#test-input"),{
        address: 'test',
        domain: 'hotmail.com',
        full: 'test@hotmail.com'
      });

      expect(emptySpy).not.toHaveBeenCalled();
    });

    it("calls the 'empty' callback with the element when there's no suggestion", function () {
      $("#test-input").val('contact@kicksend.com').mailcheck({
        suggested: suggestedSpy,
        empty: emptySpy
      });

      expect(suggestedSpy).not.toHaveBeenCalled();

      expect(emptySpy).toHaveBeenCalledWith($("#test-input"));
    });

    it("takes in an array of specified domains", function() {
      $("#test-input").val('test@emaildomain.con').mailcheck({
        suggested: suggestedSpy,
        empty: emptySpy,
        domains: domains
      });

      expect(suggestedSpy).toHaveBeenCalledWith($("#test-input"), {
        address: 'test',
        domain: 'emaildomain.com',
        full: 'test@emaildomain.com'
      });
    });

    it("escapes the element's value", function() {
      $("#test-input").val('<script>alert("a")</script>@emaildomain.con').mailcheck({
        suggested:suggestedSpy,
        empty:emptySpy,
        domains:domains
      });
      expect(suggestedSpy.mostRecentCall.args[1].address).not.toMatch(/<script>/);
    });

    describe("backwards compatibility", function () {
      it("takes in the same method signature as the first version", function () {
        $("#test-input").val('test@emaildomain.con').mailcheck(domains, {
          suggested: suggestedSpy,
          empty: emptySpy
        });

        expect(suggestedSpy).toHaveBeenCalledWith($("#test-input"), {
          address: 'test',
          domain: 'emaildomain.com',
          full: 'test@emaildomain.com'
        });
      });
    });
  });

  describe("Kicksend.mailcheck", function(){
    var mailcheck;

    beforeEach(function(){
       mailcheck = Kicksend.mailcheck;
    });

    describe("return value", function () {
      it("is a hash representing the email address", function () {
        var result = mailcheck.suggest('test@hotmail.co', domains);

        expect(result).toEqual({
          address: 'test',
          domain: 'hotmail.com',
          full: 'test@hotmail.com'
        });
      });

      it("is false when no suggestion is found", function() {
        expect(mailcheck.suggest('contact@kicksend.com', domains)).toBeFalsy();
      });

      it("is false when an incomplete email is provided", function(){
        expect(mailcheck.suggest('contact', domains)).toBeFalsy();
      });
    });

    describe("cases", function () {
      it("pass", function () {
        expect(mailcheck.suggest('test@emaildomain.co', domains).domain).toEqual('emaildomain.com');
        expect(mailcheck.suggest('test@gmail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@gnail.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@GNAIL.con', domains).domain).toEqual('gmail.com');
        expect(mailcheck.suggest('test@yahoo.com.tw', domains)).toEqual(false);
        expect(mailcheck.suggest('', domains)).toEqual(false);
        expect(mailcheck.suggest('test@', domains)).toEqual(false);
        expect(mailcheck.suggest('test', domains)).toEqual(false);
      });
    });

    describe("mailcheck.splitEmail", function () {
      it("returns a hash of the address and the domain", function () {
        expect(mailcheck.splitEmail('test@example.com')).toEqual({
          address:'test',
          domain:'example.com'
        });
      });

      it("splits RFC compliant emails", function () {
        expect(mailcheck.splitEmail('"foo@bar"@example.com')).toEqual({
          address:'"foo@bar"',
          domain:'example.com'
        });
      });

      it("returns false if email is invalid", function () {
        expect(mailcheck.splitEmail('example.com')).toBeFalsy();
      });
    });

  });
});
