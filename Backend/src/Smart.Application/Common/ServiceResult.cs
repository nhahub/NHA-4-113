namespace Smart.Application.Common
{
    // if a service returns "this failed, here's why" without throwing exceptions for
    // expected cases (e.g. "SKU already exists"). Controllers translate this to
    // the right HTTP status code (200/201 vs 400/404).
    public class ServiceResult<T>
    {
        public bool Success { get; private set; }
        public T? Data { get; private set; }
        public string? Error { get; private set; }

        public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };
        public static ServiceResult<T> Fail(string error) => new() { Success = false, Error = error };
    }
}
